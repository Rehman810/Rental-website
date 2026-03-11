import { useEffect, useRef, useState } from "react";
import { Box, Typography, Skeleton } from "@mui/material";

import "pannellum/build/pannellum.css";
import "pannellum/build/pannellum.js";

const Property360Viewer = ({
    imageUrl,
    fallbackMsg = "360° view is not available for this property.",
    isHero = false
}) => {
    const viewerRef = useRef(null);
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!imageUrl || !containerRef.current) return;

        viewerRef.current = window.pannellum.viewer(containerRef.current, {
            type: "equirectangular",
            panorama: imageUrl,
            autoLoad: true,
            pitch: 10,
            yaw: 180,
            hfov: 110,
            autoRotate: isHero ? -2 : 0,
            showZoomCtrl: !isHero,
            showFullscreenCtrl: !isHero,
            mouseZoom: !isHero
        });

        viewerRef.current.on("load", () => setLoading(false));

        return () => {
            viewerRef.current?.destroy?.();
        };
    }, [imageUrl, isHero]);

    if (!imageUrl) {
        if (isHero) return null;

        return (
            <Box sx={{ p: 4, textAlign: "center", bgcolor: "var(--bg-secondary)", borderRadius: 3 }}>
                <Typography color="var(--text-secondary">{fallbackMsg}</Typography>
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
                overflow: "hidden"
            }}
        >
            {loading && <Skeleton variant="rectangular" width="100%" height="100%" />}

            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

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