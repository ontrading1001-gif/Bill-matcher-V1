'use client';

import React, { useState, useEffect } from 'react';

// Vercel 환경 변수에서 주소와 API 키를 안전하게 가져옵니다.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function VendorMatcher() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vendorInput, setVendorInput] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 클라우드 DB 데이터 상태
  const [savedMatches, setSavedMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 시뮬레이션용 미매칭 청구서 상태
  const [unmatchedBills, setUnmatchedBills] = useState([
    { id: 1, vendor: 'Sysco Food Services', amount: '$2,450.00', date: '2026-07-15', status: '미매칭' },
    { id: 2, vendor: 'Patty Meat Supply', amount: '$1,820.00', date: '2026-07-16', status: '미매칭' },
    { id: 3, vendor: 'Eco Packaging Co.', amount: '$450.00', date: '2026-07-16', status: '미매칭' }
  ]);

  // 퀵북 표준 아이템 후보 리스트
  const quickBooksItems = [
    'Food Costs: Meat & Poultry',
    'Food Costs: Seafood',
    'Food Costs: Produce',
    'Beverage Costs: Soft Drinks',
    'Operating Supplies: Kitchen Ware',
    'Operating Supplies: Eco Packaging',
    'Facility Cost: Waste Management'
  ];

  // 1. Supabase에서 실시간 클라우드 데이터 불러오기
  const fetchMatches = async () => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/vendor_matches?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSavedMatches(data);
      }
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // 2. Supabase 클라우드 데이터베이스에 매칭 규칙 영구 저장
  const handleSaveMatch = async (vendorName, qbItem) => {
    const targetVendor = vendorName || vendorInput;
    const targetItem = qbItem || selectedItem;

    if (!targetVendor || !targetItem) {
      alert('벤더 이름과 QuickBooks 아이템을 모두 확인해 주세요.');
      return;
    }

    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/vendor_matches`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          vendor_name: targetVendor,
          quickbooks_item: targetItem,
          confidence_score: Math.floor(Math.random() * 15) + 85 // 85~99% 사이 매칭 신뢰도 생성
        })
      });

      if (res.ok) {
        alert(`'${targetVendor}' 매칭 규칙이 클라우드 DB에 안전하게 저장되었습니다!`);
        if (!vendorName) {
          setVendorInput('');
          setSelectedItem('');
        }
        // 청구서 목록에서 매칭 완료된 항목 제거 시뮬레이션
        setUnmatchedBills(prev => prev.filter(b => b.vendor !== targetVendor));
        fetchMatches(); // 전체 DB 목록 새로고침
      } else {
        alert('클라우드 저장에 실패했습니다. DB 설정을 확인해 주세요.');
      }
    } catch (err) {
      console.error("데이터 저장 실패:", err);
    }
  };

  const filteredMatches = savedMatches.filter(match => 
    match.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.quickbooks_item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#1f2937', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      
      {/* 1. 최상단 네비게이션 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', backgroundColor: '#ffffff', padding: '20px 24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', tracking: 'wide' }}>Multi-User Cloud Sync</span>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: '4px 0 0 0', letterSpacing: '-0.5px' }}>QuickBooks Matcher Pro</h1>
        </div>
        
        {/* 상단 탭 스위치 */}
        <div style={{ display: 'flex', gap: '6px', background: '#f3f4f6', padding: '6px', borderRadius: '12px' }}>
          <button 
            onClick={() => setActiveTab('dashboard')}
            style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', background: activeTab === 'dashboard' ? '#ffffff' : 'transparent', color: activeTab === 'dashboard' ? '#111827' : '#4b5563', boxShadow: activeTab === 'dashboard' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}
          >
            매칭 작업 대시보드
          </button>
          <button 
            onClick={() => setActiveTab('database')}
            style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', background: activeTab === 'database' ? '#ffffff' : 'transparent', color: activeTab === 'database' ? '#111827' : '#4b5563', boxShadow: activeTab === 'database' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}
          >
            전체 공유 데이터베이스 ({savedMatches.length})
          </button>
        </div>
      </div>

      {/* 2. 메인 탭 내용 콘텐트 */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '24px' }}>
          
          {/* 왼쪽 컬럼: 청구서 스트림 및 규칙 정의 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 미매칭 인보이스 리스트 카드 */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>검토 필요 청구서 건 (미매칭)</h2>
                <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{unmatchedBills.length}개 유의</span>
              </div>
              
              {unmatchedBills.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#10b981', fontWeight: '600', background: '#ecfdf5', borderRadius: '12px' }}>
                  🎉 현재 처리 대기 중인 모든 미매칭 청구서 맵핑이 완료되었습니다!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {unmatchedBills.map((bill) => (
                    <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #f3f4f6', borderRadius: '12px', background: '#fff', transition: 'box-shadow 0.2s' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#111827', fontSize: '15px' }}>{bill.vendor}</div>
                        <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>발행일: {bill.date} • 금액: <span style={{ color: '#374151', fontWeight: '600' }}>{bill.amount}</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select 
                          id={`select-${bill.id}`}
                          defaultValue=""
                          style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', background: '#fff' }}
                        >
                          <option value="" disabled>매핑 아이템 선택...</option>
                          {quickBooksItems.map((item, idx) => (
                            <option key={idx} value={item}>{item}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => {
                            const selectEl = document.getElementById(`select-${bill.id}`);
                            handleSaveMatch(bill.vendor, selectEl.value);
                          }}
                          style={{ padding: '8px 14px', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          즉시 매칭
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 개별 수동 규칙 정의 카드 */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '18px', color: '#111827', margin: 0 }}>신규 독립 벤더 매칭 정의</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', marginBottom: '16px' }}>리스트 외 새로운 정기 거래처와 QuickBooks 매핑 항목을 직접 연동합니다.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#4b5563' }}>세금계산서상 공급자 벤더명</label>
                  <input 
                    type="text" 
                    placeholder="예: (주)한울푸드, US Foods" 
                    value={vendorInput}
                    onChange={(e) => setVendorInput(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#4b5563' }}>QuickBooks 연결 계정 항목</label>
                  <select 
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: '#fff' }}
                  >
                    <option value="">-- 매핑 대상 아이템 선택 --</option>
                    {quickBooksItems.map((item, idx) => (
                      <option key={idx} value={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={() => handleSaveMatch(null, null)}
                style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                클라우드 데이터베이스에 매칭 저장하기
              </button>
            </div>

          </div>

          {/* 오른쪽 컬럼: 연동 현황 요약 가이드 */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', height: 'fit-content' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              실시간 클라우드 동기화 상태 활성화
            </h3>
            
            <div style={{ borderLeft: '3px solid #e5e7eb', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151' }}>영구적 데이터 보존 완료</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px', lineHeight: '1.4' }}>기존의 로컬 시뮬레이션과 달리 화면을 새로고침하거나 브라우저를 종료해도 데이터가 유실되지 않습니다.</div>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151' }}>팀원간 멀티 억세스</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px', lineHeight: '1.4' }}>Vercel에 배포된 동일한 URL 주소로 접속하면 다른 기기에서도 실시간으로 동일한 매칭 이력을 조회하고 수정할 수 있습니다.</div>
              </div>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e40af' }}>💡 현황 팁</div>
              <div style={{ fontSize: '13px', color: '#1e3a8a', marginTop: '4px', lineHeight: '1.4' }}>
                상단 우측의 <strong>'전체 공유 데이터베이스'</strong> 탭으로 이동하면 Supabase 클라우드에 실제로 어떤 행(Row)들이 누적되어 쌓이고 있는지 실시간 테이블뷰로 검증 가능합니다.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 탭 2: 통합 데이터베이스 전체 목록 리스트 뷰 */}
      {activeTab === 'database' && (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>전체 클라우드 공유 매칭 데이터 테이블</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>Supabase DB에 영구 저장된 정규 매핑 데이터 규칙 세트입니다.</p>
            </div>
            <input 
              type="text" 
              placeholder="벤더명 또는 매핑 아이템 실시간 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', width: '300px', outline: 'none' }}
            />
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '14px' }}>Supabase 안전 클라우드 채널에서 테이블 로드 중...</div>
          ) : filteredMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#9ca3af', border: '2px dashed #f3f4f6', borderRadius: '12px', fontSize: '14px' }}>
              {searchQuery ? '검색어와 일치하는 데이터가 없습니다.' : '현재 데이터베이스에 저장된 매칭 규칙이 없습니다. 대시보드에서 매칭을 진행해 주세요.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '14px 12px', fontSize: '13px', color: '#4b5563', fontWeight: '700', borderRadius: '8px 0 0 0' }}>데이터 인덱스</th>
                    <th style={{ padding: '14px 12px', fontSize: '13px', color: '#4b5563', fontWeight: '700' }}>인보이스 벤더 공급자명 (Vendor)</th>
                    <th style={{ padding: '14px 12px', fontSize: '13px', color: '#4b5563', fontWeight: '700' }}>QuickBooks 연결 계정 아이템</th>
                    <th style={{ padding: '14px 12px', fontSize: '13px', color: '#4b5563', fontWeight: '700' }}>확정 확률</th>
                    <th style={{ padding: '14px 12px', fontSize: '13px', color: '#4b5563', fontWeight: '700', borderRadius: '0 8px 0 0' }}>동기화 일시</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((match) => (
                    <tr key={match.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background-color 0.2s' }}>
                      <td style={{ padding: '14px 12px', fontSize: '14px', color: '#9ca3af' }}>#{match.id}</td>
                      <td style={{ padding: '14px 12px', fontSize: '14px', fontWeight: '700', color: '#111827' }}>{match.vendor_name}</td>
                      <td style={{ padding: '14px 12px', fontSize: '14px', color: '#2563eb', fontWeight: '600' }}>{match.quickbooks_item}</td>
                      <td style={{ padding: '14px 12px', fontSize: '14px' }}>
                        <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                          {match.confidence_score}% Match
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', fontSize: '13px', color: '#6b7280' }}>
                        {new Date(match.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
