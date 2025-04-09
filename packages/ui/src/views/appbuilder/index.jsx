import { Grid, Typography, Box } from '@mui/material'
import MainCard from '@/ui-component/cards/MainCard'

// ==============================|| APP BUILDER VIEW ||============================== //

const AppBuilder = () => {
    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <MainCard title='App Builder'>
                        <Typography variant='body1'>
                            Welcome to the App Builder! This is where you can build and customize your applications.
                        </Typography>
                    </MainCard>
                </Grid>
            </Grid>
        </Box>
    )
}

export default AppBuilder
