// resources/js/Pages/Home.jsx
import React, { useState } from 'react';
import '../../css/Home.css';

const DomainChecker = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [whoisData, setWhoisData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [dnsResults, setDnsResults] = useState([]);
  const [portResults, setPortResults] = useState(null);
  const [sslData, setSslData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [whoisLoading, setWhoisLoading] = useState(false);
  const [portLoading, setPortLoading] = useState(false);
  const [sslLoading, setSslLoading] = useState(false);
  const [recordType, setRecordType] = useState('A');
  const [selectedPorts, setSelectedPorts] = useState([]);
  const [customPort, setCustomPort] = useState('');

  const defaultPorts = [
    21, 22, 25, 53, 80, 110, 143,
    443, 465, 587, 8080, 3306, 3389
  ];

  const validateDomain = d => {
    const re = /^(?!:\/\/)(?=.{1,253}$)(?:(?:[a-zA-Z0-9_](?:[a-zA-Z0-9-_]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,})$/;
    return re.test(d);
  };
  const isIPv4 = ip => {
    const re = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
    return re.test(ip);
  };

  const togglePort = port => {
    setSelectedPorts(prev =>
      prev.includes(port)
        ? prev.filter(p => p !== port)
        : [...prev, port]
    );
  };

  const addCustomPort = () => {
    const p = parseInt(customPort, 10);
    if (!isNaN(p) && p > 0 && p < 65536 && !selectedPorts.includes(p)) {
      setSelectedPorts(prev => [...prev, p]);
      setCustomPort('');
    } else {
      setError('Enter a valid port (1–65535) not already selected.');
    }
  };

  const handleCheck = async () => {
    setError('');
    setWhoisData(null);
    setGeoData(null);
    setDnsResults([]);
    setPortResults(null);
    setSslData(null);

    const ipMode = isIPv4(input);
    const domMode = validateDomain(input);
    if (!ipMode && !domMode) {
      setError('Invalid input. Enter a valid domain or IPv4 address.');
      return;
    }

    setLoading(true);
    try {
      if (ipMode) {
        // GeoIP first
        const geoRes = await fetch(`/api/geoip?ip=${encodeURIComponent(input)}`);
        const geoJson = await geoRes.json();
        if (!geoRes.ok) throw new Error(geoJson.error || 'IP lookup failed');
        setGeoData(geoJson);

        // Then ports
        if (selectedPorts.length) {
          setPortLoading(true);
          const portRes = await fetch('/api/portcheck', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip: input, ports: selectedPorts })
          });
          const portJson = await portRes.json();
          if (!portRes.ok) throw new Error(portJson.error || 'Port check failed');
          setPortResults(portJson.results);
        } else {
          setPortResults({});
        }
      } else {
        // Domain → DNS
        const dnsRes = await fetch(
          `/api/dns-propagation?domain=${encodeURIComponent(input)}&type=${recordType}`
        );
        const dnsJson = await dnsRes.json();
        if (!dnsRes.ok) throw new Error(dnsJson.error || 'DNS lookup failed');
        setDnsResults(dnsJson);

        // then SSL check
        try {
          setSslLoading(true);
          const sslRes = await fetch(`/api/ssl-check?domain=${encodeURIComponent(input)}`);
          const sslJson = await sslRes.json();
          if (!sslRes.ok) throw new Error(sslJson.error || 'SSL check failed');
          setSslData(sslJson);
        } catch (e) {
          setError(e.message);
        } finally {
          setSslLoading(false);
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setPortLoading(false);
    }
  };

  const handleWhoisCheck = async () => {
    setError('');
    setWhoisLoading(true);
    setWhoisData(null);
    try {
      const res = await fetch(`/api/whois?domain=${encodeURIComponent(input)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'WHOIS lookup failed');
      setWhoisData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setWhoisLoading(false);
    }
  };

  const getFlagUrl = code =>
    `https://flagcdn.com/24x18/${code.toLowerCase()}.png`;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <h1 className="title">Domain & IP Checker</h1>
        <p className="subtitle">
          Check DNS propagation, WHOIS info, IP geolocation, or port status
        </p>
      </div>

      {/* Input row */}
      <div className="form-row">
        <input
          type="text"
          className="domain-input"
          placeholder="Enter domain or IP address"
          value={input}
          onChange={e => setInput(e.target.value.trim())}
        />
        <button className="check-btn" onClick={handleCheck}>
          🔍 Check
        </button>
      </div>

      {/* Mode‑specific controls */}
      {isIPv4(input) ? (
        <div className="port-selection">
          {defaultPorts.map(port => (
            <button
              key={port}
              className={`record-btn ${selectedPorts.includes(port) ? 'active' : ''}`}
              onClick={() => togglePort(port)}
            >
              {port}
            </button>
          ))}
          <input
            type="number"
            min="1" max="65535"
            placeholder="Custom"
            className="custom-port-input"
            value={customPort}
            onChange={e => setCustomPort(e.target.value)}
          />
          <button className="record-btn add-port-btn" onClick={addCustomPort}>
            Add
          </button>
        </div>
      ) : (
        <div className="record-buttons">
          {['A','AAAA','CNAME','MX','NS','TXT','SOA','CAA'].map(type => (
            <button
              key={type}
              className={`record-btn ${recordType===type ? 'active' : ''}`}
              onClick={() => setRecordType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {error && <p className="error-msg">{error}</p>}
      {loading && <div className="loading-spinner">🔄 Checking, please wait...</div>}

      <div className="info-grid">
        {/* Port panel (IP mode) */}
        {isIPv4(input) && (
          <div className="dns-section port-section">
            <h2 className="section-title">🔌 Port Check</h2>
            {portLoading ? (
              <div className="port-placeholder">🔄 Checking ports…</div>
            ) : portResults ? (
              <div className="port-results">
                {Object.entries(portResults).map(([port, isOpen]) => (
                  <div
                    key={port}
                    className={`port-item ${isOpen ? 'open' : 'closed'}`}
                  >
                    <span className="port-label">Port {port}</span>
                    <span className="status-icon">
                      {isOpen ? '✅' : '❌'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="port-placeholder">
                Select ports and click “Check” to see statuses
              </div>
            )}
          </div>
        )}

        {/* GeoIP panel (IP mode) */}
        {geoData && (
          <div className="whois-section">
            <h2 className="section-title">📍 IP Location</h2>
            <p><strong>Location:</strong><br/>{geoData.city_name}, {geoData.region_name}<br/>{geoData.country_name}</p>
            <p><strong>Coordinates:</strong><br/>{geoData.latitude}, {geoData.longitude}</p>
            <p><strong>Timezone:</strong><br/>{geoData.time_zone}</p>
            <p><strong>ISP:</strong><br/>{geoData.as}</p>
            <p><strong>ASN:</strong><br/>AS{geoData.asn}</p>
          </div>
        )}

        {/* DNS propagation (domain mode) */}
        {dnsResults.length > 0 && (
          <div className="dns-section">
            <h2 className="section-title">🌍 DNS Propagation</h2>
            <ul className="dns-list">
              {dnsResults.map((r,i) => {
                const [cc,loc] = r.location.split('-').map(p=>p.trim());
                const icon = r.status==='success'? '✅':'❌';
                return (
                  <li key={i} className={`dns-item ${r.status}`}>
                    <div className="dns-header">
                      <div className="flag">
                        <img src={getFlagUrl(cc)} alt={cc} className="flag-img" />
                        <span>{cc}</span>
                      </div>
                      <span className="region">{loc}</span>
                    </div>
                    <div className="dns-body">
                      <div className="value-block">
                        {(r.result||'—').split('\n').map((l,j)=>(
                          <div key={j} className="value-line">{l}</div>
                        ))}
                      </div>
                      <div className="status-icon">{icon}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* RIGHT COLUMN: SSL above WHOIS */}
        {dnsResults.length > 0 && (
          <div className="right-column">
            {/* SSL Status */}
            {(sslLoading || sslData) && (
              <div className="ssl-section">
                <h2 className="section-title">🔒 SSL Status</h2>
                {sslLoading ? (
                  <div className="port-placeholder">🔄 Checking SSL…</div>
                ) : (
                  sslData && (
                    <>
                      <p><strong>Issued To:</strong><br />{sslData.result.issued_to}</p>
                      <p><strong>Issuer:</strong><br />{sslData.result.issuer_o} {sslData.result.issuer_cn}</p>
                      <p><strong>Valid From:</strong><br />{new Date(sslData.result.valid_from).toLocaleDateString()}</p>
                      <p><strong>Expires On:</strong><br />{new Date(sslData.result.valid_till).toLocaleDateString()}</p>
                      <p><strong>Days Left:</strong><br />{sslData.result.days_left}</p>
                      <p><strong>Valid:</strong><br />{sslData.result.cert_valid ? '✅' : '❌'}</p>
                    </>
                  )
                )}
              </div>
            )}

            {/* WHOIS Information */}
            {!sslLoading && (
              !whoisData && !whoisLoading ? (
                <div className="whois-section">
                  <div className="whois-btn-wrapper">
                    <button className="check-btn" onClick={handleWhoisCheck}>
                      📄 Check WHOIS
                    </button>
                  </div>
                </div>
              ) : whoisLoading ? (
                <div className="whois-section">
                  <div className="loading-spinner">🔄 Fetching WHOIS data…</div>
                </div>
              ) : whoisData ? (
                <div className="whois-section">
                  <h2 className="section-title">📄 WHOIS Information</h2>
                  <p><strong>Registrar:</strong><br />{whoisData.registrar?.name}</p>
                  <p><strong>Created:</strong><br />{new Date(whoisData.create_date).toLocaleDateString()}</p>
                  <p><strong>Updated:</strong><br />{new Date(whoisData.update_date).toLocaleDateString()}</p>
                  <p><strong>Expires:</strong><br />{new Date(whoisData.expire_date).toLocaleDateString()}</p>
                  <p><strong>Nameservers:</strong></p>
                  <ul>
                    {whoisData.nameservers?.map(ns=>(
                      <li key={ns}>{ns.toUpperCase()}</li>
                    ))}
                  </ul>
                </div>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DomainChecker;
