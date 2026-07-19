'use client';

import React, { useState, useEffect } from 'react';

// Vercel 환경 변수에서 주소와 API 키를 안전하게 가져옵니다.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function VendorMatcher() {
  const [activeTab, setActiveTab] = useState('matching');
  const [vendorInput, setVendorInput] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 상태 관리 (DB 연동)
  const [savedMatches, setSavedMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Supabase에서 저장된 매칭 데이터 실시간 불러오기
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

  // 2. Supabase 데이터베이스에 새 매칭 데이터 저장하기
  const handleSaveMatch = async () => {
    if (!vendorInput || !selectedItem) {
      alert('벤더 이름과 QuickBooks 아이템을 모두 선택해주세요.');
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
          vendor_name: vendorInput,
          quickbooks_item: selectedItem,
          confidence_score: Math.floor(Math.random() * 15) + 85 // 85~99% 사이 랜덤 매칭율 시뮬레이션
        })
      });

      if (res.ok) {
        alert('데이터베이스에 안전하게 저장되었습니다!');
        setVendorInput('');
        setSelectedItem('');
        fetchMatches(); // 목록 새로고침
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (err) {
      console.error("데이터 저장 실패:", err);
    }
  };

  // 퀵북 아이템 후보 리스트
  const quickBooksItems = [
    'Food Costs: Meat & Poultry',
    'Food Costs: Seafood',
    'Food Costs: Produce',
    'Beverage Costs: Soft Drinks',
    'Operating Supplies: Kitchen Ware',
    'Operating Supplies: Eco Packaging',
    'Facility Cost: Waste Management'
  ];

  const filteredMatches = savedMatches.filter(match => 
    match.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.quickbooks_item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#1f2937' }}>
      {/* 상단 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>QuickBooks Matcher Pro</h1>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>실시간 클라우드 공유형 벤더 매칭 시스템</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
          <button 
            onClick={() => setActiveTab('matching')}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', background: activeTab === 'matching' ? '#ffffff' : 'transparent', color: activeTab === 'matching' ? '#111827' : '#4b5563', boxShadow: activeTab === 'matching' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
          >
            매칭 학습
          </button>
          <button 
            onClick={() => setActiveTab('database')}
            style={{ padding: '8px 16px', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', background: activeTab === 'database' ? '#ffffff' : 'transparent', color: activeTab === 'database' ? '#111827' : '#4b5563', boxShadow: activeTab === 'database' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s' }}
          >
            통합 데이터베이스 ({savedMatches.length})
          </button>
        </div>
      </div>

      {/* 탭 1: 매칭 학습 대시보드 */}
      {activeTab === 'matching' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* 입력 패널 */}
          <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>매칭 관계 정의</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>세금계산서상 벤더명 (인보이스 공급자명)</label>
              <input 
                type="text" 
                placeholder="예: (주)한울푸드, US Foods Inc." 
                value={vendorInput}
                onChange={(e) => setVendorInput(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>QuickBooks 연결 대상 계정 아이템 (Mapping Item)</label>
              <select 
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: '#fff', outline: 'none' }}
              >
                <option value="">-- 매칭할 퀵북 매핑 아이템 선택 --</option>
                {quickBooksItems.map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleSaveMatch}
              style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
            >
              클라우드 데이터베이스에 매칭 저장하기
            </button>
          </div>

          {/* 실시간 프리뷰 및 안내 패널 */}
          <div style={{ background: '#f9fafb', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'col', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ display: 'inline-block', padding: '12px', background: '#dbeafe', borderRadius: '50%', marginBottom: '16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>다중 사용자 데이터 실시간 동기화</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.5', margin: 0 }}>
                여기서 등록한 규칙은 Supabase 클라우드로 영구 저장되어,<br />
                다른 컴퓨터나 브라우저에서 접속한 팀원도 즉시 똑같이 조회하고 활용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 탭 2: 통합 데이터베이스 리스트 */}
      {activeTab === 'database' && (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 }}>전체 동기화 데이터 목록</h2>
            <input 
              type="text" 
              placeholder="벤더명 또는 아이템 검색..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', width: '260px' }}
            />
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>서버에서 데이터를 안전하게 불러오는 중...</div>
          ) : filteredMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', border: '1px dashed #e5e7eb', borderRadius: '8px' }}>저장된 매칭 데이터가 없습니다. 먼저 매칭을 등록해 주세요.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  <th style={{ padding: '12px', fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>ID</th>
                  <th style={{ padding: '12px', fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>인보이스 벤더명 (Vendor)</th>
                  <th style={{ padding: '12px', fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>퀵북 매핑 항목 (QuickBooks Item)</th>
                  <th style={{ padding: '12px', fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>매칭 신뢰도</th>
                  <th style={{ padding: '12px', fontSize: '13px', color: '#4b5563', fontWeight: '600' }}>저장 일시</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match) => (
                  <tr key={match.id} style={{ borderBottom: '1px solid #f3f4f6', hover: { background: '#f9fafb' } }}>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#9ca3af' }}>#{match.id}</td>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{match.vendor_name}</td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#2563eb', fontWeight: '500' }}>{match.quickbooks_item}</td>
                    <td style={{ padding: '12px', fontSize: '14px' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {match.confidence_score}%
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>
                      {new Date(match.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
