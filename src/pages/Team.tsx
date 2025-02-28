import { Card, CardContent, Grid, Typography } from "@mui/material";

export default function TeamPage() {
    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Processes
            </Typography>

            <Grid container spacing={3}>
                {/* Widget 1 */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Total Users</Typography>
                            <Typography variant="h4">1,234</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Widget 2 */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Active Sessions</Typography>
                            <Typography variant="h4">128</Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Widget 3 */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Processes Running</Typography>
                            <Typography variant="h4">42</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </div>
    );
}
