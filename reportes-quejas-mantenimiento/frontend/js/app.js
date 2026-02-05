/**
 * Portoviejo360 - Frontend de Pruebas
 * Script principal para interactuar con la API de incidencias
 */

// Configuración de la API
const getApiUrl = () => document.getElementById('apiUrl').value.trim();
const getAuthToken = () => document.getElementById('authToken').value.trim();

// Headers por defecto para las peticiones (sin Content-Type para FormData)
const getHeaders = (includeContentType = true) => {
    const headers = {
        'Authorization': `Bearer ${getAuthToken()}`
    };
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

// Log de peticiones
const logRequest = (method, url, status, responseTime, data = null) => {
    const logContainer = document.getElementById('requestLog');
    const entry = document.createElement('div');
    const isSuccess = status >= 200 && status < 300;
    
    entry.className = `log-entry ${isSuccess ? 'success' : 'error'}`;
    entry.innerHTML = `
        <div class="timestamp">${new Date().toLocaleTimeString()}</div>
        <span class="method ${method}">${method}</span>
        <span>${url}</span>
        <span style="margin-left: 10px;">→ ${status} (${responseTime}ms)</span>
        ${data ? `<pre style="margin-top: 8px; opacity: 0.8;">${JSON.stringify(data, null, 2).substring(0, 500)}</pre>` : ''}
    `;
    
    logContainer.insertBefore(entry, logContainer.firstChild);
};

// Función genérica para hacer peticiones
const apiRequest = async (method, endpoint, body = null) => {
    const url = `${getApiUrl()}${endpoint}`;
    const startTime = Date.now();
    
    try {
        const options = {
            method,
            headers: getHeaders()
        };
        
        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(url, options);
        const responseTime = Date.now() - startTime;
        const data = await response.json();
        
        logRequest(method, endpoint, response.status, responseTime, data);
        
        return {
            success: response.ok,
            status: response.status,
            data
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        logRequest(method, endpoint, 'ERR', responseTime, { error: error.message });
        
        return {
            success: false,
            status: 0,
            data: { error: error.message }
        };
    }
};

// Función para peticiones con FormData (archivos)
const apiRequestWithFiles = async (method, endpoint, formData) => {
    const url = `${getApiUrl()}${endpoint}`;
    const startTime = Date.now();
    
    try {
        const options = {
            method,
            headers: getHeaders(false), // Sin Content-Type para FormData
            body: formData
        };
        
        const response = await fetch(url, options);
        const responseTime = Date.now() - startTime;
        const data = await response.json();
        
        logRequest(method, endpoint, response.status, responseTime, data);
        
        return {
            success: response.ok,
            status: response.status,
            data
        };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        logRequest(method, endpoint, 'ERR', responseTime, { error: error.message });
        
        return {
            success: false,
            status: 0,
            data: { error: error.message }
        };
    }
};

// Mostrar resultado en un contenedor
const showResult = (containerId, data, success = true) => {
    const container = document.getElementById(containerId);
    container.className = `result-box show ${success ? 'success' : 'error'}`;
    container.textContent = JSON.stringify(data, null, 2);
};

// Almacenar archivos seleccionados
let selectedFiles = [];

// Preview de archivos
const updateFilePreview = () => {
    const preview = document.getElementById('filePreview');
    preview.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'file-preview-item';
        
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = (e) => {
            e.preventDefault();
            selectedFiles.splice(index, 1);
            updateFilePreview();
        };
        
        item.appendChild(img);
        item.appendChild(removeBtn);
        preview.appendChild(item);
    });
};

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', () => {
    // Manejar selección de archivos
    document.getElementById('incidentFiles').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        // Limitar a 5 archivos
        selectedFiles = files.slice(0, 5);
        updateFilePreview();
    });

    // Probar conexión
    document.getElementById('btnTestConnection').addEventListener('click', async () => {
        const btn = document.getElementById('btnTestConnection');
        const status = document.getElementById('connectionStatus');
        
        btn.classList.add('loading');
        status.textContent = '';
        
        try {
            const response = await fetch(`${getApiUrl().replace('/api', '')}/health`);
            const data = await response.json();
            
            if (response.ok) {
                status.className = 'status-badge status-open';
                status.textContent = '✅ Conectado';
            } else {
                status.className = 'status-badge status-closed';
                status.textContent = '❌ Error';
            }
        } catch (error) {
            status.className = 'status-badge status-closed';
            status.textContent = '❌ Sin conexión';
        }
        
        btn.classList.remove('loading');
    });

    // Crear incidencia (con soporte para archivos)
    document.getElementById('formCreateIncident').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Crear FormData para enviar con archivos
        const formData = new FormData();
        formData.append('titulo', document.getElementById('titulo').value);
        formData.append('descripcion', document.getElementById('descripcion').value);
        formData.append('prioridad_codigo', document.getElementById('prioridad_codigo').value);
        formData.append('propiedad_id', document.getElementById('propiedad_id').value);
        
        const categoria = document.getElementById('categoria_codigo').value;
        if (categoria) {
            formData.append('categoria_codigo', categoria);
        }
        
        // Agregar archivos
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });
        
        const result = await apiRequestWithFiles('POST', '/incidents', formData);
        showResult('createResult', result.data, result.success);
        
        if (result.success) {
            e.target.reset();
            selectedFiles = [];
            updateFilePreview();
        }
    });

    // Listar incidencias
    document.getElementById('btnListIncidents').addEventListener('click', async () => {
        const status = document.getElementById('filterStatus').value;
        const limit = document.getElementById('filterLimit').value;
        
        let endpoint = `/incidents?limit=${limit}`;
        if (status) {
            endpoint += `&estado=${status}`;
        }
        
        const result = await apiRequest('GET', endpoint);
        const container = document.getElementById('incidentsList');
        
        if (result.success && result.data.data && result.data.data.length > 0) {
            container.innerHTML = result.data.data.map(incident => `
                <div class="incident-card">
                    <h3>#${incident.id} - ${escapeHtml(incident.titulo)}</h3>
                    <p>${escapeHtml(incident.descripcion?.substring(0, 100) || '')}...</p>
                    <div class="meta">
                        <span class="status-badge status-${incident.estado_codigo?.toLowerCase() || 'open'}">
                            ${incident.estado_codigo || 'OPEN'}
                        </span>
                        <span class="status-badge priority-${incident.prioridad_codigo?.toLowerCase() || 'medium'}">
                            ${incident.prioridad_codigo || 'MEDIUM'}
                        </span>
                    </div>
                    <p style="margin-top: 10px; font-size: 0.75rem;">
                        📅 ${new Date(incident.fecha_creacion).toLocaleDateString()}
                    </p>
                </div>
            `).join('');
        } else if (result.success) {
            container.innerHTML = '<div class="empty-state">No se encontraron incidencias</div>';
        } else {
            container.innerHTML = `<div class="result-box show error">${JSON.stringify(result.data, null, 2)}</div>`;
        }
    });

    // Obtener incidencia por ID
    document.getElementById('btnGetById').addEventListener('click', async () => {
        const id = document.getElementById('incidentId').value;
        if (!id) {
            alert('Por favor ingresa un ID de incidencia');
            return;
        }
        
        const result = await apiRequest('GET', `/incidents/${id}`);
        showResult('detailResult', result.data, result.success);
    });

    // Eliminar incidencia
    document.getElementById('btnDeleteById').addEventListener('click', async () => {
        const id = document.getElementById('incidentId').value;
        if (!id) {
            alert('Por favor ingresa un ID de incidencia');
            return;
        }
        
        if (!confirm(`¿Estás seguro de eliminar la incidencia #${id}?`)) {
            return;
        }
        
        const result = await apiRequest('DELETE', `/incidents/${id}`);
        showResult('detailResult', result.data, result.success);
    });

    // Actualizar estado
    document.getElementById('btnUpdateStatus').addEventListener('click', async () => {
        const id = document.getElementById('updateId').value;
        if (!id) {
            alert('Por favor ingresa un ID de incidencia');
            return;
        }
        
        const body = {
            estado_codigo: document.getElementById('newStatus').value
        };
        
        const description = document.getElementById('statusDescription').value;
        if (description) {
            body.descripcion = description;
        }
        
        const result = await apiRequest('PATCH', `/incidents/${id}/status`, body);
        showResult('updateResult', result.data, result.success);
    });

    // Agregar comentario
    document.getElementById('btnAddComment').addEventListener('click', async () => {
        const id = document.getElementById('commentIncidentId').value;
        const content = document.getElementById('commentContent').value;
        
        if (!id) {
            alert('Por favor ingresa un ID de incidencia');
            return;
        }
        
        if (!content) {
            alert('Por favor ingresa el contenido del comentario');
            return;
        }
        
        const body = {
            contenido: content,
            es_interno: document.getElementById('commentInternal').checked
        };
        
        const result = await apiRequest('POST', `/incidents/${id}/comentarios`, body);
        showResult('commentResult', result.data, result.success);
        
        if (result.success) {
            document.getElementById('commentContent').value = '';
        }
    });

    // Limpiar log
    document.getElementById('btnClearLog').addEventListener('click', () => {
        document.getElementById('requestLog').innerHTML = '';
    });
});

// Utilidad para escapar HTML
const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Guardar configuración en localStorage
const saveConfig = () => {
    localStorage.setItem('portoviejo360_apiUrl', getApiUrl());
    localStorage.setItem('portoviejo360_token', getAuthToken());
};

// Cargar configuración desde localStorage
const loadConfig = () => {
    const savedUrl = localStorage.getItem('portoviejo360_apiUrl');
    const savedToken = localStorage.getItem('portoviejo360_token');
    
    if (savedUrl) {
        document.getElementById('apiUrl').value = savedUrl;
    }
    if (savedToken) {
        document.getElementById('authToken').value = savedToken;
    }
};

// Auto-guardar configuración
document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    
    document.getElementById('apiUrl').addEventListener('change', saveConfig);
    document.getElementById('authToken').addEventListener('change', saveConfig);
});
