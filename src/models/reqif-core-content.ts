import { ReqIFReqIFContent } from "./reqif-req-if-content";
import { ReqIFReqIFHeader } from "./reqif-reqif-header";

/**
 * Represents the core content of a ReqIF document.
 * Contains the header information and the actual ReqIF content.
 */
export class ReqIFCoreContent {
  constructor(
    public reqIfHeader: ReqIFReqIFHeader,
    public reqIfContent: ReqIFReqIFContent,
  ) {}
}
