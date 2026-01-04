import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileFormValues, csvUploadSchema } from "@/schemas/fileSchema";
import { uploadFile } from "@/services/fileService";

type StatusMessage = {
    type: "success" | "danger";
    message: string;
};

const FileAdd: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FileFormValues>({
        resolver: zodResolver(csvUploadSchema),
    });

    const [uploadStatus, setUploadStatus] = useState<StatusMessage | null>(
        null
    );

    const onSubmit: SubmitHandler<FileFormValues> = async (data) => {
        const file = data.csvFile[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await uploadFile(formData);
            setUploadStatus({
                type: "success",
                message: `Upload complete: ${file.name}`,
            });
            reset();
        } catch (error) {
            console.error("Upload failed", error);
            setUploadStatus({
                type: "danger",
                message: "Upload failed. Check console.",
            });
        }

        setUploadStatus({
            type: "success",
            message: `Upload complete: ${file.name}`,
        });
        reset();
    };

    return (
        <div className="container mt-5">
            <div
                className="card shadow-sm"
                style={{ maxWidth: "500px", margin: "0 auto" }}
            >
                <div className="card-header bg-dark text-white">
                    <h5 className="mb-0">Import Data</h5>
                </div>
                <div className="card-body">
                    {uploadStatus && (
                        <div
                            className={`alert alert-${uploadStatus.type} alert-dismissible fade show`}
                            role="alert"
                        >
                            {uploadStatus.message}
                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setUploadStatus(null)}
                            ></button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label
                                htmlFor="csvFile"
                                className="form-label fw-bold"
                            >
                                Select Source File
                            </label>
                            <input
                                id="csvFile"
                                type="file"
                                accept=".csv"
                                className={`form-control ${
                                    errors.csvFile ? "is-invalid" : ""
                                }`}
                                {...register("csvFile")}
                            />

                            {/* Error Handling */}
                            {errors.csvFile && (
                                <div className="invalid-feedback d-block">
                                    {errors.csvFile.message?.toString()}
                                </div>
                            )}

                            <div className="form-text text-muted">
                                Format: .csv
                            </div>
                        </div>

                        <div className="d-grid gap-2">
                            <button type="submit" className="btn btn-primary">
                                Process CSV
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FileAdd;
