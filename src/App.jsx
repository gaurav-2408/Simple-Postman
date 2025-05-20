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
  const [responseStatus, setResponseStatus] = useState('');

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

  const sendRequest = async () => {
    try {
      const requestConfig = {
        method: 'POST',
        url: '/api/request',
        data: {
          endPoint: url,
          httpMethod: method,
          headers: headers.reduce((acc, { key, value }) => {
            if (key && value) {
              acc[key] = value;
            }
            return acc;
          }, {}),
          body: method !== 'GET' ? body : undefined
        }
      };

      console.log('Sending request to backend:', requestConfig);
      try {
        const response = await axios(requestConfig);
        console.log('Response:', response.data);
        // The status code from the backend's response is in response.data.status
        setResponseStatus(response.data.status || response.status);
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
    }
  };

  return (
    <div className="container">
      <h2>DISH Postman</h2>
      
      <div className="top-bar">
        <select value={method} onChange={handleMethodChange}>
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
          <option>PATCH</option>
        </select>
        <input 
          type="text" 
          value={url} 
          onChange={handleUrlChange} 
          placeholder="https://jsonplaceholder.typicode.com/posts"
        />
        <button onClick={sendRequest}>Send</button>
      </div>

      <div className="request-response">
        <div className="request">
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'headers' ? 'active' : ''}`} 
              onClick={() => setActiveTab('headers')}
            >
              Headers
            </div>
            <div 
              className={`tab ${activeTab === 'body' ? 'active' : ''}`} 
              onClick={() => setActiveTab('body')}
            >
              Body
            </div>
            <div 
              className={`tab ${activeTab === 'auth' ? 'active' : ''}`} 
              onClick={() => setActiveTab('auth')}
            >
              Authorization
            </div>
            <div 
              className={`tab ${activeTab === 'scripts' ? 'active' : ''}`} 
              onClick={() => setActiveTab('scripts')}
            >
              Scripts
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'headers' ? 'active' : ''}`}>
            <label>Headers</label>
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {headers.map((header, index) => (
                  <tr key={index}>
                    <td>
                      <input 
                        type="text" 
                        value={header.key} 
                        onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                        placeholder="Content-Type"
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={header.value} 
                        onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                        placeholder="application/json"
                      />
                    </td>
                    <td>
                      <button onClick={() => removeHeader(index)}>❌</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addHeader}>+ Add Header</button>
          </div>

          <div className={`tab-content ${activeTab === 'body' ? 'active' : ''}`}>
            <label>Body (JSON)</label>
            <textarea 
              value={body} 
              onChange={handleBodyChange} 
              placeholder='{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}'
            />
          </div>

          <div className={`tab-content ${activeTab === 'auth' ? 'active' : ''}`}>
            <label>Bearer Token</label>
            <input 
              type="text" 
              value={authToken} 
              onChange={handleAuthChange} 
              placeholder="eyJhbGciOiJIUzI1..."
            />
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
  );
}

export default App;
