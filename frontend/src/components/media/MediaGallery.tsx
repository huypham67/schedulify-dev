import React from 'react';
import {
  Box,
  ImageList,
  ImageListItem,
  Typography,
  IconButton,
  useMediaQuery,
  useTheme,
  Modal,
  Button
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Media } from '../../api/media';

interface MediaGalleryProps {
  media: Media[];
  title?: string;
  onDeleteMedia?: (mediaId: string) => void;
  allowDelete?: boolean;
  cols?: number;
  height?: number;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  media,
  title,
  onDeleteMedia,
  allowDelete = false,
  cols = 3,
  height = 200
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedMedia, setSelectedMedia] = React.useState<Media | null>(null);
  
  const handleOpenPreview = (mediaItem: Media) => {
    setSelectedMedia(mediaItem);
  };
  
  const handleClosePreview = () => {
    setSelectedMedia(null);
  };
  
  const handleDeleteClick = (event: React.MouseEvent, mediaId: string) => {
    event.stopPropagation(); // Prevent opening preview
    if (onDeleteMedia) {
      onDeleteMedia(mediaId);
    }
  };
  
  if (media.length === 0) {
    return null;
  }
  
  return (
    <Box sx={{ mt: 2 }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      
      <ImageList cols={isMobile ? 2 : cols} rowHeight={height} gap={8}>
        {media.map((item) => (
          <ImageListItem key={item._id} sx={{ cursor: 'pointer', position: 'relative' }} onClick={() => handleOpenPreview(item)}>
            {item.mimetype.startsWith('image/') ? (
              <img
                src={`/api/media/${item._id}`}
                alt={item.originalFilename}
                loading="lazy"
                style={{ height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <video
                src={`/api/media/${item._id}`}
                style={{ height: '100%', objectFit: 'cover' }}
              />
            )}
            
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                opacity: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 1,
                }
              }}
            >
              <IconButton 
                color="primary" 
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              >
                <ZoomInIcon />
              </IconButton>
              
              {allowDelete && onDeleteMedia && (
                <IconButton 
                  color="error" 
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    position: 'absolute',
                    top: 5,
                    right: 5,
                  }}
                  onClick={(e) => handleDeleteClick(e, item._id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </ImageListItem>
        ))}
      </ImageList>
      
      {/* Media Preview Modal */}
      <Modal
        open={!!selectedMedia}
        onClose={handleClosePreview}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing(2),
        }}
      >
        <Box sx={{ 
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          outline: 'none',
          backgroundColor: 'black',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconButton
            onClick={handleClosePreview}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white',
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
          
          {selectedMedia && selectedMedia.mimetype.startsWith('image/') ? (
            <img
              src={`/api/media/${selectedMedia._id}`}
              alt={selectedMedia.originalFilename}
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
              }}
            />
          ) : selectedMedia && (
            <video
              src={`/api/media/${selectedMedia._id}`}
              controls
              autoPlay
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
              }}
            />
          )}
          
          {selectedMedia && allowDelete && onDeleteMedia && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<DeleteIcon />}
                onClick={() => {
                  if (selectedMedia) {
                    onDeleteMedia(selectedMedia._id);
                    handleClosePreview();
                  }
                }}
              >
                Delete Media
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default MediaGallery; 