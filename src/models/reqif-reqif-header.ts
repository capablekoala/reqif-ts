/**
 * Represents the ReqIF header section.
 * Contains metadata about the ReqIF document.
 */
export class ReqIFReqIFHeader {
  constructor(
    public identifier: string,
    public creationTime: string,
    public repositoryId?: string,
    public reqIfToolId?: string,
    public reqIfVersion?: string,
    public sourceToolId?: string,
    public title?: string,
    public comment?: string,
  ) {}
}
