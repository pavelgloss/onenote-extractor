export interface Notebook {
    id: string;
    self: string;
    createdDateTime: string;
    displayName: string;
    lastModifiedDateTime: string;
    isDefault: boolean;
    userRole: string;
    isShared: boolean;
    sectionsUrl: string;
    sectionGroupsUrl: string;
    createdBy: {
        user: {
            id: string;
            displayName: string;
        }
    };
    lastModifiedBy: {
        user: {
            id: string;
            displayName: string;
        }
    };
    links: {
        oneNoteClientUrl: {
            href: string;
        };
        oneNoteWebUrl: {
            href: string;
        }
    }
}

export interface Section {
  id: string;
  self: string;
  createdDateTime: string;
  displayName: string;
  lastModifiedDateTime: string;
  isDefault: boolean;
  pagesUrl: string;
  createdBy: {
    user: {
      id: string;
      displayName: string;
    };
  };
  lastModifiedBy: {
    user: {
      id: string;
      displayName: string;
    };
  };
  parentNotebook: {
    id: string;
    displayName: string;
    self: string;
  };
  parentSectionGroup: null | object;

  // these fields are present in the OneNote API response, but nedb does not support '.' in property names, so will be deleted using delete operator
  "parentNotebook@odata.context"?: string;
  "parentSectionGroup@odata.context"?: string;
}

export interface SectionGroup {
  id: string;
  displayName: string;
}

export interface Page {
  "@odata.nextLink": string;
  id: string;
  self: string;
  createdDateTime: string;
  title: string;
  createdByAppId: string;
  contentUrl: string;
  lastModifiedDateTime: string;
  links: {
    oneNoteClientUrl: {
      href: string;
    };
    oneNoteWebUrl: {
      href: string;
    };
  };
  parentSection: {
    id: string;
    displayName: string;
    self: string;
  };

  "parentSection@odata.context"?: string;
}

export interface GraphApiResponse<T> {
  value: T[];
  "@odata.nextLink"?: string;
  "@odata.count"?: number;
}