import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const MAX_FILE_SIZE = 500000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["text/csv", "application/vnd.ms-excel"]; // Excel sometimes claims CSVs are its own.

export const csvUploadSchema = z.object({
    csvFile: z
        .custom<FileList>()
        .refine((files) => files instanceof FileList, "Expected a file list")
        .refine((files) => files.length > 0, "A CSV file is required.")
        .refine((files) => {
            const file = files[0];
            return file && file.size <= MAX_FILE_SIZE;
        }, `Max file size exceded`)
        .refine((files) => {
            const file = files[0];
            // Check MIME type OR extension (fallback for some OSs)
            return (
                file &&
                (ACCEPTED_IMAGE_TYPES.includes(file.type) ||
                    file.name.endsWith(".csv"))
            );
        }, "Only .csv files are allowed."),
});

export type FileFormValues = z.infer<typeof csvUploadSchema>;