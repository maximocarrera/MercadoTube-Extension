// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const statusDiv = document.getElementById('status');
    const videoContainer = document.getElementById('video-container');
    const h3Element = document.querySelector('h3');
    
    // Tu clave de API de YouTube
    const YOUTUBE_API_KEY = 'AIzaSyDfzOKfZlprzI6H2YlevAlYTtDGX65ZrGU'; 

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        
        // Primero, inyectamos el script para obtener los datos
        chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ['content.js']
        }, () => {
            if (chrome.runtime.lastError) {
                h3Element.innerText = 'Error al cargar la extensión.';
                statusDiv.innerText = chrome.runtime.lastError.message;
                return;
            }

            // Luego, enviamos un mensaje para que content.js nos devuelva los datos
            chrome.tabs.sendMessage(activeTab.id, { action: "getProductDetails" }, async (response) => {
                if (chrome.runtime.lastError) {
                    h3Element.innerText = 'Error de comunicación.';
                    statusDiv.innerText = chrome.runtime.lastError.message;
                    return;
                }

                if (!response || !response.title) {
                    h3Element.innerText = 'No se pudo obtener el título del producto.';
                    statusDiv.innerText = 'Asegúrate de estar en una página de producto válida.';
                    return;
                }
                
                // Usamos el título obtenido de content.js para la búsqueda en YouTube
                const productName = response.title;
                const searchQuery = `${productName} reseña`;

                h3Element.innerText = `Buscando reseña para: ${productName}...`;
                statusDiv.innerText = '';
                
                // Construimos la URL de la API de YouTube para la búsqueda
                const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=1`;

                try {
                    const youtubeResponse = await fetch(youtubeApiUrl);
                    const data = await youtubeResponse.json();

                    if (data.items && data.items.length > 0) {
                        const videoId = data.items[0].id.videoId;
                        const videoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

                        const iframe = document.createElement('iframe');
                        iframe.src = videoUrl;
                        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                        iframe.allowFullscreen = true;

                        videoContainer.innerHTML = '';
                        videoContainer.appendChild(iframe);
                        h3Element.innerText = 'Reseña de YouTube:';
                        
                    } else {
                        h3Element.innerText = 'No se encontró ninguna reseña de YouTube.';
                        statusDiv.innerText = 'Intenta una búsqueda manual.';
                    }
                } catch (error) {
                    console.error('Error al buscar en YouTube:', error);
                    h3Element.innerText = 'Ocurrió un error en la búsqueda.';
                    statusDiv.innerText = 'Verifica tu clave de API o la conexión.';
                }
            });
        });
    });
});