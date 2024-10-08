import axios from 'axios';
import { config } from '../config';
import { GraphApiResponse, Notebook, Page, Section, SectionGroup, StoredPageContent } from '../types/graphTypes';
import { OpenAIService } from './OpenAIService';
import { logger } from '../utils/logger';
import { userPrompts } from '../prompts/userPrompts';
const Datastore = require('@seald-io/nedb');

interface StoredAnalyzedContent {
    pageId: string;
    title: string;   // duplicate

    classification: string[];
    businessPriority: number;
    aiRelated: boolean;
    chaoticLevel: number;
    classificationInfo: string;
    businessPriorityInfo: string;
    aiRelatedInfo: string;
    chaoticLevelInfo: string;

    refusal: string | null;
    finishReason: string;
}

export class OneNoteExtractor {
    private readonly accessToken: string;
    private readonly dbNotebooks: any;
    private readonly dbSections: any;
    private readonly dbPages: any;
    private readonly dbPagesContent: any;
    private readonly dbPagesContentAnalyzed: any;

    // examples nedb
    // await this.db.findAsync({ url: url });
    // const newBookmark: SavedBookmark = await this.db.insertAsync(bookmark);


    constructor(accessToken: string = 'empty') {
        this.accessToken = accessToken;

        this.dbNotebooks = new Datastore({ filename: 'db-notebooks.db', corruptAlertThreshold: 0 });
        this.dbSections = new Datastore({ filename: 'db-sections.db', corruptAlertThreshold: 0 });
        this.dbPages = new Datastore({ filename: 'db-pages.db', corruptAlertThreshold: 0 });
        this.dbPagesContent = new Datastore({ filename: 'db-pages-content.db', corruptAlertThreshold: 0 });
        this.dbPagesContentAnalyzed = new Datastore({ filename: 'db-pages-content-analyzed.db', corruptAlertThreshold: 0 });

        // await this.dbNotebooks.loadDatabaseAsync();

        // without async
        this.dbNotebooks.loadDatabase();
        this.dbSections.loadDatabase();
        this.dbPages.loadDatabase();
        this.dbPagesContent.loadDatabase();
        this.dbPagesContentAnalyzed.loadDatabase();
    }

    /** 
     * when loading pages from notebooks and sections, it happened, that one page from 4541 items was duplicated (1 copy) 
     * so I dont believe oneNote API is perfect, so I will check the integrity of the pages
     * 
     * TODO one more test, get all pages from API, after all is synced, and dont edit any page in onenote
    */
    async checkPagesIntegrity() {
        const database1 = new Datastore({ filename: 'db-consistency-test/db-pages.db', corruptAlertThreshold: 0 });
        const database2 = new Datastore({ filename: 'db-consistency-test/db-pages2.db', corruptAlertThreshold: 0 });
        database1.loadDatabase();
        database2.loadDatabase();

        const pages = await database2.findAsync({}) as Page[];
        const pagesMap = new Map<string, Page>();
        const duplicateIds = new Set<string>();

        // create new array where each page object is extended with "_id" property  (nedb documents has "_id" property)
        const pageDocuments = pages.map(page => ({ ...page, _id: page["_id"] /* works only with strict: false */ }));

        pages.forEach(page => {
            if (pagesMap.has(page.id)) {
                duplicateIds.add(page.id);
            }
            pagesMap.set(page.id, page);

            // page._id    document id is always unique
        });

        console.log('pages count: ' + pages.length);
        console.log('pagesMap count: ' + pagesMap.size);
        console.log('Duplicate page IDs:', Array.from(duplicateIds));
    }



    async loadNotesAndBuildDatabase() {
        const notebooks = await this.getNotebooks();
        let totalPageCount = 0;

        for (const notebook of notebooks) {
            let pagesCountPerNotebook = 0;
            await this.dbNotebooks.insertAsync(notebook);

            console.log('-------------------------------------------------------------------');
            console.log(`${notebook.displayName}    (id: ${notebook.id})`);
            console.log('-------------------------------------------------------------------');

            const sectionGroups = await this.getSectionGroups(notebook.id);
            // if (sectionGroups.length > 0) {
            //     console.log('  Section Groups:');
            //     for (const sectionGroup of sectionGroups) {
            //         console.log(`    ${sectionGroup.displayName}    (id: ${sectionGroup.id})`);
            //     }
            // }

            const sections = await this.getSections(notebook.id);

            for (const section of sections) {

                delete section["parentNotebook@odata.context"];    // nedb does not support '.' in property names
                delete section["parentSectionGroup@odata.context"];    // nedb does not support '.' in property names

                console.log(section);

                await this.dbSections.insertAsync(section);

                console.log(`  ${section.displayName}    (id: ${section.id})`);

                const sectionPages = await this.getSectionPages(section.id);
                for (const page of sectionPages) {
                    delete page["parentSection@odata.context"];    // nedb does not support '.' in property names
                    await this.dbPages.insertAsync(page);
                }

                pagesCountPerNotebook += sectionPages.length;
            }

            totalPageCount += pagesCountPerNotebook;

            console.log('sections per notebook: ' + sections.length);
            console.log('pages per notebook: ' + pagesCountPerNotebook);
        }

        console.log('-------------------------------------------------------------------');
        console.log('final stats:');
        console.log('pages count: ' + totalPageCount);

    }

    /**
     * Analyze all notes that were not analyzed yet and add them to the database
     * Adding into collection db-pages-content-analyzed  (1:1 relation with db-pages-content collection)
     * @param openAIService 
     */
    async analyzeNotProcessedNotesAndAddToDB(openAIService: OpenAIService) {
        const contentList = await this.dbPagesContent.findAsync({}) as StoredPageContent[];

        for (const doc of contentList) {
            logger.info('pageId: ' + doc.pageId + ',  title: ' + doc.title);

            if (doc.content?.trim() !== '') {
                const userPrompt = userPrompts.v3(doc.content);

                // search if content was already analyzed
                const existingAnalyzedContent = await this.dbPagesContentAnalyzed.findAsync({ pageId: doc.pageId }) as StoredAnalyzedContent[];
                if (existingAnalyzedContent.length > 0) {
                    logger.info('Content already analyzed, skipping');
                    continue;
                }

                try {
                    const respMessage = await openAIService.generateResponse(userPrompt);

                    if (respMessage?.jsonMessage !== null) {
                        logger.info('response: ', respMessage?.jsonMessage);

                        // validate json
                        let parsedJson: any;
                        try {
                            parsedJson = JSON.parse(respMessage?.jsonMessage as string);

                            // TODO add into analyzed collection
                            const analyzedContent: StoredAnalyzedContent = {
                                pageId: doc.pageId,
                                title: doc.title,
                                classification: parsedJson.classification,
                                businessPriority: parsedJson.businessPriority,
                                aiRelated: parsedJson.aiRelated,
                                chaoticLevel: parsedJson.chaoticLevel,
                                classificationInfo: parsedJson.classificationInfo,
                                businessPriorityInfo: parsedJson.businessPriorityInfo,
                                aiRelatedInfo: parsedJson.aiRelatedInfo,
                                chaoticLevelInfo: parsedJson.chaoticLevelInfo,
                                refusal: respMessage!.refusal ?? null,
                                finishReason: respMessage!.finishReason,
                            };

                            // insert async 
                            await this.dbPagesContentAnalyzed.insertAsync(analyzedContent);
                            logger.info('Content analyzed and saved to database');

                        } catch (error) {
                            logger.error('Failed to parse response as JSON:', error);
                        }

                    } else {
                        logger.error('NULL message from openai service');
                    }

                    logger.info('***********************************************************************');

                } catch (error) {
                    logger.error('Error during classification:', error);
                    logger.error('-----');
                    if (error.message) {
                        logger.error('error.message:', error.message);
                    }

                    logger.error('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
                }

            } else {
                logger.info('empty content');
            }

            // await this.dbPagesContent.updateAsync({ _id: doc["_id"] }, doc);



            // await this.dbPagesContent.updateAsync(
            //     //{ _id: pageContent["_id"] },
            //     { pageId: pageContent.pageId },
            //     { $set: { "content": pageContent.content + "---" + pageContent["_id"] } },
            //     // { upsert: false, multi: false}  
            // );
        }

    }


    // extract "6501ad45c6e64b18a4c6b584f2fc2199" from pageId string like "0-6501ad45c6e64b18a4c6b584f2fc2199!1-96CCEE3E8641EB68!82646"
    private extractIdentifierFromPageId(pageId: string): string {
        const parts = pageId.split('!');

        const id = parts[0];
        return id;
    }

    async createHtmlPages() {
        const pagesContentList = await this.dbPagesContent.findAsync({}) as StoredPageContent[];

        for (const pageContent of pagesContentList) {
            const htmlContent = pageContent.content;
            const htmlFileName = this.extractIdentifierFromPageId(pageContent.pageId) + '.html';

            // save to file
            const fs = require('fs');

            fs.writeFileSync('html-pages/' + htmlFileName, htmlContent);
        }
    }

    /**
     * Load all pages from the database and load content for each page from the onenote API
     * and continue adding and saving each content to the database
     */
    async loadPagesContentAndContinueBuildingDatabase() {
        const pages = await this.dbPages.findAsync({}) as Page[];
        const notFoundPages: string[] = [];

        console.log('Total pages in the database: ' + pages.length);

        for (const page of pages) {
            const existingContent = await this.dbPagesContent.findAsync({ pageId: page.id });
            if (existingContent.length > 0) {
                console.log('Page content already exists in database: ' + page.title);
                continue;
            }

            const pageContent: string = await this.getPageContent(page.id);

            if (pageContent === null) {
                console.log('Page content not found: ' + page.title);
                notFoundPages.push(page.id + " " + page.title);
                continue;
            }

            let contentDocument = {
                "pageId": page.id,
                "title": page.title,
                "content": pageContent
            };

            await this.dbPagesContent.insertAsync(contentDocument);
            console.log('Page content saved: ' + page.title);
        }

        // print pages not found
        console.log('Pages not found:');
        notFoundPages.forEach(page => {
            console.log('  ' + page);
        });
    }


    // private async getDataFromGraphApi<T>(apiEndpoint: string): Promise<GraphApiResponse<T>> {    }

    private async getDataFromGraphApiInternal(apiEndpoint: string): Promise<any> {
        // DEBUG
        //console.log('calling api:', apiEndpoint);

        // periodically try to fetch data and increase wait between retries, until successful
        let response;
        let retries = 0;
        let waitTime = 1000;
        while (true) {
            try {
                response = await axios.get(apiEndpoint, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`,
                    },
                });
                break;

            } catch (error) {
                console.log('Error fetching data from Graph API: ' + error.message);
                // get status code

                // if status is 404
                if (error.response.status === 404) {
                    console.log('Error 404: Resource not found');
                    return null;
                }

                // if the response is 429 Too Many Requests
                // a better way would be to read header Retry-After: xx in the response and wait for that time (in seconds)


                console.log('Error API call for ' + retries + '. times, waiting for ' + waitTime / 1000 + ' sec before next call');
                console.log('Error endpoint: ' + apiEndpoint);

                await new Promise(resolve => setTimeout(resolve, waitTime));

                waitTime *= 2;
                retries++;
            }
        }

        return response.data;
    }



    async getPageContent(pageId: string): Promise<string> {
        const apiEndpoint = `${config.graphApiUrl}/pages/${pageId}/content`;
        const content: string = await this.getDataFromGraphApiInternal(apiEndpoint);     // page content is the whole api response

        return content;
    }

    async getNotebooks(): Promise<Notebook[]> {
        const apiEndpoint = `${config.graphApiUrl}/notebooks`;
        // const data = await this.getDataFromGraphApi<Notebook>(apiEndpoint);
        const data: GraphApiResponse<Notebook> = await this.getDataFromGraphApiInternal(apiEndpoint);

        return data.value;
    }

    async getSections(notebookId: string): Promise<Section[]> {
        const apiEndpoint = `${config.graphApiUrl}/notebooks/${notebookId}/sections`;
        // const data = await this.getDataFromGraphApi<Section>(apiEndpoint);
        const data: GraphApiResponse<Section> = await this.getDataFromGraphApiInternal(apiEndpoint);
        return data.value;
    }

    async getSectionGroups(notebookId: string): Promise<SectionGroup[]> {
        const apiEndpoint = `${config.graphApiUrl}/notebooks/${notebookId}/sectionGroups`;
        // const data = await this.getDataFromGraphApi<SectionGroup>(apiEndpoint);
        const data: GraphApiResponse<SectionGroup> = await this.getDataFromGraphApiInternal(apiEndpoint);
        return data.value;
    }

    async getSectionPages(sectionId: string): Promise<Page[]> {
        const pages: Page[] = [];
        let countIterations = 1;

        // result is paged, so we need to iterate all pages using the '@odata.nextLink' property
        // and concatenate all pages into the pages array

        let nextLink: string = `${config.graphApiUrl}/sections/${sectionId}/pages?count=true`;    // first page api call
        let countByOdataCount: number = 0;
        while (nextLink) {

            // const data = await this.getDataFromGraphApi<Page>(nextLink);     

            // this can throw an error ERR_BAD_REQUEST   429 Too Many Requests
            const data: GraphApiResponse<Page> = await this.getDataFromGraphApiInternal(nextLink);

            pages.push(...data.value);

            if (countIterations === 1) {
                countByOdataCount = data['@odata.count'] as number;
            }

            nextLink = data['@odata.nextLink'] as string;
            countIterations++;

        }

        console.log('    Total counted pages per section: ' + pages.length);

        if (countByOdataCount !== pages.length) {
            console.log('    WARNING: Count by @odata.count is different from the actual pages count');
            throw new Error('Count by @odata.count is different from the actual pages count');
        }

        console.log('  ----------------------------------------');

        return pages;
    }

    async getAllPages(): Promise<Page[]> {
        const allPages: Page[] = [];
        let pageCount = 0;
        let countIterations = 1;

        // cannot set top=100, because it will not return the @odata.count property
        // let nextLink: string = `${config.graphApiUrl}/pages?$count=true&top=100`;

        let nextLink: string = `${config.graphApiUrl}/pages`;    // first page api call
        while (nextLink) {
            // const data = await this.getDataFromGraphApi<Page>(nextLink);
            const data: GraphApiResponse<Page> = await this.getDataFromGraphApiInternal(nextLink);
            allPages.push(...data.value);

            if (countIterations === 1) {
                console.log('Count by @odata.count: ' + data['@odata.count']);
            }
            console.log(`[${countIterations}]: chunk loaded `);
            for (const page of data.value) {
                pageCount++;
                console.log(" " + pageCount + ". " + page.title);
            }

            nextLink = data['@odata.nextLink'] as string;   // for subsequent api call in paged result
            console.log('nextLink: ' + nextLink);
            countIterations++;
        }

        console.log('Total counted pages: ' + allPages.length);

        return allPages;
    }

}