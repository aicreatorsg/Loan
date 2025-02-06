import React, { useState } from 'react';
import {
    Button,
    Box,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import { uploadMembersFromExcel } from '../services/memberService';

export default function MemberUpload({ onUploadComplete }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setError(null);
            setSuccess(false);

            const result = await uploadMembersFromExcel(file);
            setSuccess(true);
            if (onUploadComplete) {
                onUploadComplete();
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            setError("Failed to upload members. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <Box sx={{ mb: 3 }}>
            <input
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                id="member-file-upload"
                onChange={handleFileUpload}
                disabled={uploading}
            />
            <label htmlFor="member-file-upload">
                <Button
                    variant="contained"
                    component="span"
                    disabled={uploading}
                >
                    {uploading ? (
                        <>
                            <CircularProgress size={24} sx={{ mr: 1 }} />
                            Uploading...
                        </>
                    ) : (
                        'Upload Member List'
                    )}
                </Button>
            </label>

            {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                    Members uploaded successfully!
                </Alert>
            )}
        </Box>
    );
}
