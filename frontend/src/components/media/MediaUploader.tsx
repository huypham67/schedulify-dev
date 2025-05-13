import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

interface MediaUploaderProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  allowedTypes?: string[]; // e.g. ['image/jpeg', 'image/png', 'video/mp4']
  initialFiles?: File[];
  showPreview?: boolean;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({
  onFilesSelected,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // Default 10MB
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
  initialFiles = [],
  showPreview = true
}) => {
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    // Create previews for initial files if any
    if (initialFiles.length > 0 && showPreview) {
      const initialPreviews = initialFiles.map(file => URL.createObjectURL(file));
      setPreviews(initialPreviews);
    }
    
    // Cleanup function to revoke object URLs
    return () => {
      previews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [initialFiles]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setLoading(true);
    
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      
      // Check if adding these files would exceed the max files limit
      if (files.length + selectedFiles.length > maxFiles) {
        setError(`You can only upload a maximum of ${maxFiles} files`);
        setLoading(false);
        return;
      }
      
      // Validate file types and sizes
      const validFiles: File[] = [];
      const invalidFiles: string[] = [];
      
      selectedFiles.forEach(file => {
        const isValidType = allowedTypes.includes(file.type);
        const isValidSize = file.size <= maxSize;
        
        if (isValidType && isValidSize) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      });
      
      if (invalidFiles.length > 0) {
        setError(`Some files were skipped due to invalid type or size: ${invalidFiles.join(', ')}`);
      }
      
      if (validFiles.length > 0) {
        // Create preview URLs
        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        
        // Update state
        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        setPreviews([...previews, ...newPreviews]);
        
        // Call the parent component's callback
        onFilesSelected(updatedFiles);
      }
    }
    
    setLoading(false);
    
    // Reset the file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleRemoveFile = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    
    // Remove the file from the state
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
    
    // Call the parent component's callback
    onFilesSelected(updatedFiles);
  };
  
  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<PhotoCameraIcon />}
          disabled={loading || files.length >= maxFiles}
        >
          {loading ? <CircularProgress size={24} /> : 'Select Files'}
          <input
            type="file"
            accept={allowedTypes.join(',')}
            hidden
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={loading || files.length >= maxFiles}
          />
        </Button>
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          {`Max ${maxFiles} files. Accepted formats: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}. Max size: ${maxSize / (1024 * 1024)}MB.`}
        </Typography>
      </Box>
      
      {showPreview && previews.length > 0 && (
        <Grid container spacing={2}>
          {previews.map((preview, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card sx={{ position: 'relative' }}>
                {files[index].type.startsWith('image/') ? (
                  <CardMedia
                    component="img"
                    src={preview}
                    sx={{ height: 140, objectFit: 'cover' }}
                  />
                ) : (
                  <CardMedia
                    component="video"
                    src={preview}
                    sx={{ height: 140, objectFit: 'cover' }}
                    controls
                  />
                )}
                <IconButton
                  size="small"
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                  }}
                  onClick={() => handleRemoveFile(index)}
                >
                  <CloseIcon />
                </IconButton>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MediaUploader; 