import React from 'react';
import Lottie from 'lottie-react';
import { Box } from '@mui/material';
import farmerAnimation from '../assets/animations/farmer.json';

export default function FarmerAnimation({ width = '100%', height = '100%' }) {
    return (
        <Box 
            sx={{ 
                width, 
                height,
                position: 'relative',
                '&:hover': {
                    transform: 'scale(1.05)',
                    transition: 'transform 0.3s ease-in-out'
                }
            }}
        >
            <Lottie
                animationData={farmerAnimation}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
            />
        </Box>
    );
}
