import { useEffect, useRef } from 'react';
import { useTitleContext } from '../context/TitleContext';
import { useTranslation } from 'react-i18next';

/**
 * Hook to set the page title dynamically.
 * @param {string} titleInput - The title key or string to display.
 * @param {Object} options - Options for translation and overrides.
 * @param {boolean} [options.translate=true] - Whether to translate the titleInput.
 * @param {Object} [options.values] - values for interpolation in translation.
 */
const usePageTitle = (titleInput, options = {}) => {
    const { pushTitle, popTitle, updateTitle } = useTitleContext();
    const { t } = useTranslation();
    const idRef = useRef(null);

    const shouldTranslate = options.translate !== false;
    // If specific override values are passed, use them.
    const resolvedTitle = shouldTranslate
        ? t(titleInput, options.values || options)
        : titleInput;

    useEffect(() => {
        // Push title to stack on mount
        const id = pushTitle(resolvedTitle);
        idRef.current = id;

        return () => {
            // Remove title from stack on unmount
            popTitle(id);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array ensures we only push/pop once per component mount

    useEffect(() => {
        // Update title in place when resolvedTitle changes
        if (idRef.current) {
            updateTitle(idRef.current, resolvedTitle);
        }
    }, [resolvedTitle, updateTitle]);
};

export default usePageTitle;
