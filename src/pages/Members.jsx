import React from 'react';
import { Container, Typography } from '@mui/material';
import MemberList from '../components/MemberList';

export default function Members() {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Member List
            </Typography>
            <MemberList />
        </Container>
    );
}
