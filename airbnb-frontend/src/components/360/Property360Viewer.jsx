import React, { Suspense, useState } from "react";
import { Box, Typography, Skeleton } from "@mui/material";

// Dynamic import for client-side rendering only and lazy loading
const PannellumComponent = React.lazy(() => import("pannellum-react").then(module => ({ default: module.Pannellum })));

const Property360Viewer = ({ imageUrl, fallbackMsg = "360° view is not available for this property.", isHero = false }) => {
    const [error, setError] = useState(false);

    if (!imageUrl || error) {
        if (isHero) return null;
        return (
            <Box sx={{ p: 4, textAlign: "center", bgcolor: "var(--bg-secondary)", borderRadius: 3 }}>
                <Typography color="var(--text-secondary)">{fallbackMsg}</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: "100%",
                height: isHero ? "100%" : { xs: 350, md: 500 },
                position: "relative",
                borderRadius: isHero ? 0 : 3,
                overflow: "hidden",
                "& .pnlm-container": {
                    width: "100%",
                    height: "100%",
                }
            }}
        >
            <Suspense fallback={<Skeleton variant="rectangular" width="100%" height="100%" />}>
                <PannellumComponent
                    width="100%"
                    height="100%"
                    image={imageUrl}
                    pitch={10}
                    yaw={180}
                    hfov={110}
                    autoLoad
                    showZoomCtrl={!isHero}
                    showFullscreenCtrl={!isHero}
                    mouseZoom={!isHero}
                    autoRotate={isHero ? -2 : 0}
                    onError={() => setError(true)}
                />
            </Suspense>

            {isHero && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)",
                        pointerEvents: "none",
                        zIndex: 1
                    }}
                />
            )}
        </Box>
    );
};

export default Property360Viewer;
