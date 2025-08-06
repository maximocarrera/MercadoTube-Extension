// content.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action === "getProductDetails") {
            const productData = {
                title: null,
                originalPrice: null,
                discountedPrice: null,
                imageUrl: null,
                category: null // Nuevo campo para la categoría
            };

            // Selector para el Título del Producto
            const titleElement = document.querySelector('h1.ui-pdp-title');
            if (titleElement) {
                productData.title = titleElement.innerText.trim();
            }

            console.log("Datos extraídos de Mercado Libre:", productData);
            sendResponse(productData);
        }
        return true; // IMPORTANTE: Mantiene el canal de comunicación abierto.
    }
);