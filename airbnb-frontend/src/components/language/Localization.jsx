import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

/**
 * Hook to detect if the current language is RTL
 */
export const useRTL = () => {
    const { i18n } = useTranslation();
    return i18n.language === 'ur' || i18n.language === 'ar';
};

/**
 * Reusable RTL Wrapper that applies RTL direction and text alignment
 * based on the active language.
 */
export const RTLWrapper = ({ children, sx = {}, ...props }) => {
    const isRTL = useRTL();

    return (
        <Box
            dir={isRTL ? 'rtl' : 'ltr'}
            sx={{
                textAlign: isRTL ? 'right' : 'left',
                ...(isRTL && {
                    // Force flex items to reverse for RTL if needed
                    '& .MuiStack-root': {
                        flexDirection: props.direction === 'row' ? 'row-reverse' : props.direction,
                    },
                    // Swap margins/paddings for specific MUI sub-components
                    '& .MuiInputAdornment-root': {
                        marginLeft: 0,
                        marginRight: 1,
                    },
                    '& .MuiButton-startIcon': {
                        marginLeft: 1,
                        marginRight: -0.5,
                    },
                    '& .MuiButton-endIcon': {
                        marginLeft: -0.5,
                        marginRight: 1,
                    },
                }),
                ...sx,
            }}
            {...props}
        >
            {children}
        </Box>
    );
};

export default RTLWrapper;
