'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  // --- Supabase 클라이언트 상태 ---
  const [supabaseClient, setSupabaseClient] = useState(null);

  // --- 상태 관리 (State) ---
  const [activeTab, setActiveTab] = useState('tab1');
  
  // 초기값은 민중님의 시뮬레이션 데이터를 기본으로 유지하되, DB 로드 시 업데이트됩니다.
  const [qbItems, setQbItems] = useState([
    { code: 'QB001', description: '고추장 10kg', unit: 'BOX' },
    { code: 'QB002', description: '참기름 1L', unit: 'BTL' },
    { code: 'QB003', description: '냉동 낙지 1kg', unit: 'PK' },
    { code: 'QB004', description: '국산 쌀 20kg', unit: 'BAG' },
    { code: 'QB005', description: '식용유 18L', unit: 'CAN' }
  ]);

  const [vendors, setVendors] = useState([
    { id: 1, name: '아산유통', alias: '아산식품, (주)아산' }
  ]);

  const [extractedItems, setExtractedItems] = useState([
    { id: 1, vendorItem: '아산유통고추장 대 용량', quantity: 2, unit: 'BOX', matchedCode: 'QB001', multiplier: 1, status: '학습 완료' },
    { id: 2, vendorItem: '아산유통참기름 오일', quantity: 12, unit: 'EA', matchedCode: '', multiplier: 1, status: '매칭 대기' }
  ]);

  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorAlias, setNewVendorAlias] = useState('');
  const [newQbCode, setNewQbCode] = useState('');
  const [newQbDesc, setNewQbDesc] = useState('');
  const [newQbUnit, setNewQbUnit] = useState('BOX');

  // --- 빌드 에러 방지용 CDN Supabase 초기화 및 데이터 불러오기 ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
    script.async = true;
    script.onload = () => {
      if (window.supabase) {
        const client = window.supabase.createClient(
          'https://bozcfudyqcrrgjhwuztf.supabase.co',
          'sb_publishable_sxeYShGE5vkuOe5-Mbnv1w_hTg8VV3Z'
        );
        setSupabaseClient(client);
      }
    };
    document.body.appendChild(script);
  }, []);

  // Supabase 연결 완료 후 실시간 DB 데이터 불러오기
  useEffect(() => {
    if (!supabaseClient) return;

    async function loadDatabaseData() {
      const { data: qb } = await supabaseClient.from('qb_items').select('*');
      const { data: v } = await supabaseClient.from('vendors').select('*');
      const { data: ext } = await supabaseClient.from('extracted_items').select('*');
      
      if (qb && qb.length > 0) setQbItems(qb);
      if (v && v.length > 0) setVendors(v);
      if (ext && ext.length > 0) setExtractedItems(ext);
    }
    loadDatabaseData();
  }, [supabaseClient]);

  // --- 이벤트 핸들러 ---
  const handleFileUpload = (e) => {
    // 새로운 시뮬레이션 데이터 추가
    const newItem = { 
      id: Date.now(), 
      vendorItem: '신규 추출 품목: 냉동 새우 2kg', 
      quantity: 5, 
      unit: 'PK', 
      matchedCode: '', 
      multiplier: 1, 
      status: '매칭 대기' 
    };
    
    setExtractedItems([...extractedItems, newItem]);
    alert("🧾 벤더 빌 파일이 선택되었습니다! (AI 데이터 추출 시뮬레이션 결과가 목록에 추가되었습니다.)");
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#334155', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* 스타일 시트 주입 (Tailwind 미작동 대비 완벽한 CSS 보장) */}
        <style>{`
          .app-card { bg-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05); border: 1px solid #f1f5f9; padding: 28px; background: white; }
          .tab-btn { padding: 10px 20px; font-size: 14px; font-weight: 500; border: none; border-radius: 8px; background: transparent; color: #64748b; cursor: pointer; transition: all 0.2s; }
          .tab-btn.active { background: #ffffff; color: #2563eb; font-weight: 600; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1); }
          .upload-box { border: 2px dashed #cbd5e1; background: #f8fafc; border-radius: 12px; padding: 40px 20px; text-align: center; cursor: pointer; position: relative; transition: all 0.2s; }
          .upload-box:hover { background: #f1f5f9; border-color: #94a3b8; }
          .btn-primary { background: #2563eb; color: white; border: none; padding: 10px 18px; font-size: 13px; font-weight: 500; border-radius: 8px; cursor: pointer; transition: background 0.2s; }
          .btn-primary:hover { background: #1d4ed8; }
          .btn-dark { background: #0f172a; color: white; border: none; padding: 12px 20px; font-size: 14px; font-weight: 500; border-radius: 8px; cursor: pointer; width: 100%; transition: background 0.2s; }
          .btn-dark:hover { background: #1e293b; }
          .table-style { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
          .table-style th { background: #f8fafc; padding: 14px; font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #edf2f7; }
          .table-style td { padding: 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
          .input-style { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #f8fafc; font-size: 14px; transition: border 0.2s; outline: none; }
          .input-style:focus { border-color: #2563eb; background: #fff; }
          .status-badge { color: #10b981; font-weight: 500; font-size: 13px; display: inline-flex; align-items: center; gap: 4px; }
        `}</style>

        {/* 대시보드 타이틀 헤더 */}
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em', margin: '0 0 6px 0' }}>QuickBooks Matcher</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>벤더 빌 매칭 및 단위 변환 자동 학습 시스템 {!supabaseClient && "(데이터베이스 연결 중...)"}</p>
        </header>

        {/* 클로드 스타일 네비게이션 탭 바 */}
        <div style={{ background: '#e2e8f0', padding: '6px', borderRadius: '12px', display: 'inline-flex', gap: '4px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('tab1')} className={`tab-btn ${activeTab === 'tab1' ? 'active' : ''}`}>1. 빌 매칭 검토</button>
          <button onClick={() => setActiveTab('tab2')} className={`tab-btn ${activeTab === 'tab2' ? 'active' : ''}`}>2. 벤더 등록</button>
          <button onClick={() => setActiveTab('tab3')} className={`tab-btn ${activeTab === 'tab3' ? 'active' : ''}`}>3. 벤더 명칭 관리</button>
          <button onClick={() => setActiveTab('tab4')} className={`tab-btn ${activeTab === 'tab4' ? 'active' : ''}`}>4. 퀵북 아이템 관리</button>
        </div>

        {/* 메인 콘텐츠 카드 */}
        <div className="app-card">
          
          {/* TAB 1: 빌 매칭 검토 */}
          {activeTab === 'tab1' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>벤더 빌 파일 업로드</h2>
              <div className="upload-box">
                <input type="file" onChange={handleFileUpload} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} accept="image/*,.pdf" />
                <div style={{ fontSize: '15px', fontWeight: '500', color: '#475569' }}>영수증, 벤더 빌 이미지 또는 PDF 파일을 여기에 드래그하거나 클릭하세요</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '6px' }}>현재 시뮬레이션용 데이터 2건이 아래에 로드되어 있습니다.</div>
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginTop: '40px', marginBottom: '4px' }}>추출 데이터 및 퀵북 매칭 검토</h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>단위가 다를 경우 배수를 입력하여 퀵북 기준 수량으로 환산하세요.</p>
              
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table className="table-style">
                  <thead>
                    <tr>
                      <th>벤더 / 빌 품목명</th>
                      <th>빌 수량 / 단위</th>
                      <th>퀵북 아이템 매칭 (설명/코드)</th>
                      <th style={{ width: '120px' }}>단위 변환 배수</th>
                      <th>최종 퀵북 수량</th>
                      <th>상태 및 저장</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedItems.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: '600', color: '#1e293b' }}>{item.vendorItem}</td>
                        <td style={{ color: '#475569' }}>{item.quantity} {item.unit}</td>
                        <td>
                          <select value={item.matchedCode} onChange={(e) => {
                            const updated = extractedItems.map(i => i.id === item.id ? { ...i, matchedCode: e.target.value } : i);
                            setExtractedItems(updated);
                          }} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', width: '100%', background: '#f8fafc' }}>
                            <option value="">-- 퀵북 아이템 선택 --</option>
                            {qbItems.map(qb => (
                              <option key={qb.code} value={qb.code}>{qb.description} ({qb.code}) [{qb.unit}]</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>x</span>
                            <input type="number" value={item.multiplier} onChange={(e) => {
                              const updated = extractedItems.map(i => i.id === item.id ? { ...i, multiplier: Number(e.target.value) } : i);
                              setExtractedItems(updated);
                            }} style={{ width: '60px', padding: '6px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px' }} />
                          </div>
                        </td>
                        <td style={{ fontWeight: '700', color: '#334155' }}>
                          {item.quantity * item.multiplier} {qbItems.find(q => q.code === item.matchedCode)?.unit || item.unit}
                        </td>
                        <td>
                          {item.status === '학습 완료' ? (
                            <span className="status-badge">✓ 학습 완료</span>
                          ) : (
                            <button onClick={async () => {
                              const updated = extractedItems.map(i => i.id === item.id ? { ...i, status: '학습 완료' } : i);
                              setExtractedItems(updated);
                              
                              if (supabaseClient) {
                                await supabaseClient.from('extracted_items')
                                  .update({ status: '학습 완료', matchedCode: item.matchedCode, multiplier: item.multiplier })
                                  .eq('id', item.id);
                              }
                              alert("매칭 규칙이 성공적으로 시스템에 저장 및 학습되었습니다.");
                            }} className="btn-primary">매칭 학습 저장</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: 벤더 등록 */}
          {activeTab === 'tab2' && (
            <div style={{ maxWidth: '460px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>신규 신뢰 벤더 등록</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>벤더 정식 명칭</label>
                  <input type="text" placeholder="예: 아산유통" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} className="input-style" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '6px' }}>인식 대치 에일리어스 (쉼표로 구분)</label>
                  <input type="text" placeholder="예: 아산식품, (주)아산" value={newVendorAlias} onChange={(e) => setNewVendorAlias(e.target.value)} className="input-style" />
                </div>
                <button onClick={async () => {
                  if(!newVendorName) return;
                  const newRow = { name: newVendorName, alias: newVendorAlias };
                  setVendors([...vendors, { id: Date.now(), ...newRow }]);
                  
                  if (supabaseClient) {
                    await supabaseClient.from('vendors').insert([newRow]);
                  }
                  setNewVendorName(''); setNewVendorAlias('');
                  alert("✅ 새로운 벤더가 정상 등록되었습니다.");
                }} className="btn-dark" style={{ marginTop: '8px' }}>벤더 등록하기</button>
              </div>
            </div>
          )}

          {/* TAB 3: 벤더 명칭 관리 */}
          {activeTab === 'tab3' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>벤더별 텍스트 별칭 (Alias) 매핑 리스트</h2>
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table className="table-style">
                  <thead>
                    <tr>
                      <th>정식 벤더명</th>
                      <th>등록된 별칭들 (AI가 동일 회사로 동기화하는 명칭)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v) => (
                      <tr key={v.id}>
                        <td style={{ fontWeight: '600', color: '#0f172a' }}>{v.name}</td>
                        <td style={{ color: '#475569' }}>{v.alias}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: 퀵북 아이템 관리 */}
          {activeTab === 'tab4' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
              
              {/* 왼쪽 입력 폼 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>직접 단건 추가</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" placeholder="아이템 코드 (예: QB006)" value={newQbCode} onChange={(e) => setNewQbCode(e.target.value)} className="input-style" />
                    <input type="text" placeholder="아이템 설명(명칭)" value={newQbDesc} onChange={(e) => setNewQbDesc(e.target.value)} className="input-style" />
                    <select value={newQbUnit} onChange={(e) => setNewQbUnit(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc' }}>
                      <option value="BOX">BOX</option>
                      <option value="BTL">BTL (병)</option>
                      <option value="PK">PK (팩)</option>
                      <option value="BAG">BAG (포대)</option>
                      <option value="CAN">CAN (캔)</option>
                    </select>
                    <button onClick={async () => {
                      if(!newQbCode || !newQbDesc) return;
                      const newRow = { code: newQbCode, description: newQbDesc, unit: newQbUnit };
                      setQbItems([...qbItems, newRow]);
                      
                      if (supabaseClient) {
                        await supabaseClient.from('qb_items').insert([newRow]);
                      }
                      setNewQbCode(''); setNewQbDesc('');
                      alert("📦 퀵북 아이템이 마스터 목록에 추가되었습니다.");
                    }} className="btn-dark">아이템 추가</button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>대량 엑셀 업로드 (.xlsx / .csv)</h3>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>퀵북 아이템 리스트 파일을 드롭하여 일괄 등록합니다.</p>
                  <div className="upload-box" style={{ padding: '24px 12px' }}>
                    <input type="file" onChange={handleExcelUpload} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} accept=".xlsx,.csv" />
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>📄 여기에 엑셀 파일을 드롭하세요</span>
                  </div>
                </div>
              </div>

              {/* 오른쪽 아이템 리스트 */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>퀵북 마스터 아이템 목록 ({qbItems.length}건)</h3>
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                  <table className="table-style">
                    <thead>
                      <tr>
                        <th style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>코드</th>
                        <th style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>아이템 설명</th>
                        <th style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>기준 단위</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qbItems.map((qb, index) => (
                        <tr key={index}>
                          <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0f172a' }}>{qb.code}</td>
                          <td>{qb.description}</td>
                          <td><span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>{qb.unit}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
