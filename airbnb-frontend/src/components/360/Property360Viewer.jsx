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
    const [hasError, setHasError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!imageUrl || !containerRef.current) return;

        setLoading(true);
        setHasError(false);

        try {
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
                mouseZoom: !isHero,
                onLoad: () => setLoading(false),
                onError: () => {
                    setHasError(true);
                    setLoading(false);
                }
            });

            viewerRef.current.on("load", () => setLoading(false));
            viewerRef.current.on("error", () => {
                setHasError(true);
                setLoading(false);
            });
        } catch (e) {
            setHasError(true);
            setLoading(false);
        }

        return () => {
            viewerRef.current?.destroy?.();
        };
    }, [imageUrl, isHero]);

    if (!imageUrl || hasError) {
        if (isHero && !imageUrl) return null;

        return (
            <Box
                sx={{
                    width: "100%",
                    height: isHero ? "100%" : { xs: 350, md: 500 },
                    position: "relative",
                    borderRadius: isHero ? 0 : 3,
                    overflow: "hidden",
                    backgroundImage: `url(${imageUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                {isHero && (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
                            zIndex: 1
                        }}
                    />
                )}
                {hasError && !isHero && (
                    <Typography 
                        sx={{ 
                            zIndex: 2, 
                            color: "white", 
                            bgcolor: "rgba(0,0,0,0.6)", 
                            px: 2, 
                            py: 1, 
                            borderRadius: 2 
                        }}
                    >
                        {fallbackMsg}
                    </Typography>
                )}
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
            {loading && (
                <Box sx={{ position: "absolute", inset: 0, zIndex: 5 }}>
                    <Skeleton variant="rectangular" width="100%" height="100%" />
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: `url(${imageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: 0.5,
                            filter: "blur(4px)"
                        }}
                    />
                </Box>
            )}

            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

            {isHero && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
                        pointerEvents: "none",
                        zIndex: 1
                    }}
                />
            )}
        </Box>
    );
};

export default Property360Viewer;