'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('tab1');
  const [qbItems, setQbItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [extractedItems, setExtractedItems] = useState([]);

  // 설치 없이 Supabase 사용하기 위한 초기화
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
    script.onload = () => {
      const supabase = window.supabase.createClient(
        'https://bozcfudyqcrrgjhwuztf.supabase.co',
        'sb_publishable_sxeYShGE5vkuOe5-Mbnv1w_hTg8VV3Z'
      );

      async function fetchData() {
        const { data: qb } = await supabase.from('qb_items').select('*');
        const { data: v } = await supabase.from('vendors').select('*');
        const { data: ext } = await supabase.from('extracted_items').select('*');
        
        if (qb) setQbItems(qb);
        if (v) setVendors(v);
        if (ext) setExtractedItems(ext);
      }
      fetchData();
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>QuickBooks Matcher</h1>
          <p style={{ color: '#64748b' }}>데이터베이스 연결 완료 (CDN 방식)</p>
        </header>

        {/* 탭 버튼 및 나머지 UI는 민중님이 주셨던 코드 그대로 사용하시면 됩니다 */}
        {/* 이 부분에 기존의 탭 클릭 및 테이블 코드들을 붙여넣으세요 */}
        <div style={{ padding: '20px', background: 'white', borderRadius: '16px' }}>
          <p>데이터 로딩 중입니다... Supabase와 연결되었습니다.</p>
        </div>
      </div>
    </div>
  );
}
