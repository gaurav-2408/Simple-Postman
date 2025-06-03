import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [response, setResponse] = useState('');
  const [activeTab, setActiveTab] = useState('headers');
  const [curlCommand, setCurlCommand] = useState('');
  const [parsedCurl, setParsedCurl] = useState({
    method: 'GET',
    url: '',
    headers: [],
    body: ''
  });
  const [responseStatus, setResponseStatus] = useState('');
  const [requestHistory, setRequestHistory] = useState(JSON.parse(localStorage.getItem('requestHistory')) || []);

  // Save request to history
  const saveToHistory = () => {
    const request = {
      id: Date.now(),
      method,
      url,
      headers: [...headers],
      body,
      authToken,
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [request, ...requestHistory].slice(0, 10); // Keep only last 10 requests
    setRequestHistory(newHistory);
    localStorage.setItem('requestHistory', JSON.stringify(newHistory));
  };

  // Load request from history
  const loadFromHistory = (request) => {
    setMethod(request.method);
    setUrl(request.url);
    setHeaders(request.headers);
    setBody(request.body);
    setAuthToken(request.authToken);
  };

  // Update state when curl is parsed
  React.useEffect(() => {
    if (parsedCurl.url) {
      setMethod(parsedCurl.method);
      setUrl(parsedCurl.url);
      setHeaders(parsedCurl.headers);
      setBody(parsedCurl.body);
    }
  }, [parsedCurl]);

  const handleMethodChange = (e) => {
    setMethod(e.target.value);
  };

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };

  const handleBodyChange = (e) => {
    setBody(e.target.value);
  };

  const handleAuthChange = (e) => {
    setAuthToken(e.target.value);
  };

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index) => {
    const newHeaders = headers.filter((_, i) => i !== index);
    setHeaders(newHeaders);
  };

  const parseCurlCommand = (command) => {
    try {
      const parsed = {
        method: 'GET',
        url: '',
        headers: [],
        body: ''
      };
      
      // Remove the curl command word and any trailing backslashes
      const cleanedCommand = command.replace(/curl\s*/i, '').replace(/\\\s*$/g, '').trim();
      
      // Split by spaces while preserving quoted strings and handling newlines
      const parts = cleanedCommand.match(/(?:["']([^"'] *)["']|\S+)/g) || [];
      
      // Process each part
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        // Skip --location flag as it's not needed for our request
        if (part.startsWith('--location')) {
          continue;
        }
        
        // Extract method
        if (part.startsWith('-X')) {
          const method = parts[i + 1];
          if (method) {
            parsed.method = method.toUpperCase();
            i++; // Skip next part since it's the method
          }
        }
        // Extract URL
        else if (part.startsWith('http')) {
          parsed.url = part;
        }
        // Extract headers
        else if (part.startsWith('-H')) {
          const header = parts[i + 1];
          if (header) {
            const [key, value] = header.split(':').map(s => s.trim());
            if (key && value) {
              parsed.headers.push({ key, value });
            }
            i++; // Skip next part since it's the header value
          }
        }
        // Extract body
        else if (part.startsWith('--data') || part.startsWith('-d')) {
          const body = parts[i + 1];
          if (body) {
            // Try to parse JSON if possible
            try {
              // Handle JSON body with escaped quotes
              const cleanedBody = body.replace(/\\"/g, '"');
              parsed.body = JSON.parse(cleanedBody);
            } catch (e) {
              parsed.body = body;
            }
            i++; // Skip next part since it's the body
          }
        }
      }
      
      // Update preview
      setParsedCurl(parsed);
    } catch (error) {
      console.error('Error parsing curl command:', error);
      setParsedCurl({
        method: 'GET',
        url: '',
        headers: [],
        body: ''
      });
      setResponse('Error parsing curl command');
    }
  };

  const sendRequest = async () => {
    try {
      const config = {
        method: method.toLowerCase(),
        url,
        headers: headers.reduce((acc, curr) => {
          if (curr.key && curr.value) {
            acc[curr.key] = curr.value;
          }
          return acc;
        }, {}),
        data: body
      };

      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await axios(config);
      setResponse(JSON.stringify(response.data, null, 2));
      setResponseStatus(`Status: ${response.status}`);
      
      // Save to history after successful request
      saveToHistory();
    } catch (error) {
      setResponse(error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
      setResponseStatus(`Error: ${error.response?.status || 'Unknown error'}`);
    }
        // Handle both JSON and text responses
        if (typeof response.data === 'string') {
          setResponse(response.data);
        } else {
          setResponse(JSON.stringify(response.data, null, 2));
        }
      } catch (error) {
        console.error('Error:', error);
        // Handle error response
        if (error.response) {
          setResponseStatus(error.response.status);
          setResponse(JSON.stringify(error.response.data, null, 2));
        } else {
          setResponseStatus('Error');
          setResponse('Unexpected error occurred');
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setResponse('Unexpected error occurred');

    const response = await axios(config);
    setResponse(JSON.stringify(response.data, null, 2));
    setResponseStatus(`Status: ${response.status}`);
    
    // Save to history after successful request
    saveToHistory();
  } catch (error) {
    <div className="container">
      <h2>DISH Postman</h2>
      
      <div className="request-section">
        <div className="history-section">
          <h3>Request History</h3>
          <div className="history-list">
            {requestHistory.map((request) => (
              <div 
                key={request.id} 
                className="history-item"
                onClick={() => loadFromHistory(request)}
              >
                <span>{request.method}</span>
                <span>{request.url}</span>
                <span>{new Date(request.timestamp).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="request">
          <div className="method-selector">
            <select value={method} onChange={handleMethodChange}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>
          <div className="url-input">
            <input 
              type="text" 
              value={url} 
              onChange={handleUrlChange} 
              placeholder="Enter URL"
            />
          </div>
          <div className="auth-token">
            <input 
              type="text" 
              value={authToken} 
              onChange={handleAuthChange} 
              placeholder="Bearer Token (optional)"
            />
          </div>
          <div className="tab-container">
            <button 
              className={`tab ${activeTab === 'headers' ? 'active' : ''}`} 
              onClick={() => setActiveTab('headers')}
            >
              Headers
            </button>
            <button 
              className={`tab ${activeTab === 'body' ? 'active' : ''}`} 
              onClick={() => setActiveTab('body')}
            >
              Body
            </button>
            <button 
              className={`tab ${activeTab === 'curl' ? 'active' : ''}`} 
              onClick={() => setActiveTab('curl')}
            >
              cURL
            </button>
          </div>
          {activeTab === 'headers' && (
            <div className="headers-section">
              {headers.map((header, index) => (
                <div key={index} className="header-row">
                  <input 
                    type="text" 
                    value={header.key} 
                    onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                    placeholder="Key"
                  />
                  <input 
                    type="text" 
                    value={header.value} 
                    onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    placeholder="Value"
                  />
                  <button onClick={() => removeHeader(index)}>Remove</button>
                </div>
              ))}
              <button onClick={addHeader}>Add Header</button>
            </div>
          )}
          {activeTab === 'body' && (
            <div className="body-section">
              <textarea 
                value={body} 
                onChange={handleBodyChange} 
                placeholder="Enter request body"
              />
            </div>
          )}
          {activeTab === 'curl' && (
            <div className="curl-section">
              <textarea 
                value={curlCommand} 
                onChange={(e) => {
                  setCurlCommand(e.target.value);
                  parseCurlCommand(e.target.value);
                }} 
                placeholder="Enter cURL command"
              />
              <button onClick={() => {
                const command = `curl -X ${method.toUpperCase()} ${url}`;
                headers.forEach(header => {
                  if (header.key && header.value) {
                    command += ` -H "${header.key}: ${header.value}"`;
                  }
                });
                if (body.trim()) {
                  command += ` -d '${body}'`;
          </div>

          <div className={`tab-content ${activeTab === 'curl' ? 'active' : ''}`}>
            <label>cURL Command</label>
            <textarea 
              value={curlCommand} 
              onChange={(e) => {
                setCurlCommand(e.target.value);
                parseCurlCommand(e.target.value);
              }} 
              placeholder="Enter cURL command"
            />
            <button onClick={() => {
              const command = `curl -X ${method.toUpperCase()} ${url}`;
              headers.forEach(header => {
                if (header.key && header.value) {
                  command += ` -H "${header.key}: ${header.value}"`;
                }
              });
              if (body.trim()) {
                command += ` -d '${body}'`;
              }
              setCurlCommand(command);
            }}>Generate cURL</button>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'scripts' ? 'active' : ''}`}>
            <label>Pre-request Script</label>
            <textarea placeholder="// Write your pre-request script here" />
            <label>Test Script</label>
            <textarea placeholder="// Write your test script here" />
          </div>
        </div>

        <div className="response">
          <div className="response-header">
            <span className="status-code" data-status={responseStatus.toString()}>
              Status: {responseStatus}
            </span>
          </div>
          <pre className="response-data">{response}</pre>
        </div>
      </div>
    </div>
    </>
  );
}

export default App;
