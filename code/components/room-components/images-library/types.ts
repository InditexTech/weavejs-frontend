export type ImageStatus = "pending" | "working" | "available" | "failed";
export type ImageOperation =
  | "uploaded"
  | "background-removal"
  | "image-generation"
  | "image-edition";

export type ImageEntity = {
  roomId: string;
  imageId: string;
  status: ImageStatus;
  operation: ImageOperation;
  mimeType: string | null;
  fileName: string | null;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  jobId: string | null;
  removalJobId: string | null;
  removalStatus: ImageStatus | null;
  createdAt: Date;
  updatedAt: Date;
};
