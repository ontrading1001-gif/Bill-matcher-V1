'use client';

import React, { useState } from 'react';

// 기본 탭 기능을 구현하기 위한 커스텀 컴포넌트
const Tabs = ({ children, defaultValue }) => {
  const [v, setV] = useState(defaultValue);
  return <div className="w-full bg-white rounded-xl shadow-sm border border-slate-100 p-6">{React.Children.map(children, c => React.cloneElement(c, { activeValue: v, setActiveValue: setV }))}</div>;
};
const TabsList = ({ children, activeValue, setActiveValue }) => (
  <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-xl mb-6 w-max">{React.Children.map(children, c => React.cloneElement(c, { activeValue, setActiveValue }))}</div>
);
const TabsTrigger = ({ children, value, activeValue, setActiveValue }) => (
  <button onClick={() => setActiveValue(value)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeValue === value ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}>{children}</button>
);
const TabsContent = ({ children, value, activeValue }) => activeValue === value ? <div className="animate-fadeIn">{children}</div> : null;

export default function Home() {
  // --- 1. 상태 관리 (State) ---
  const [qbItems, setQbItems] = useState([
    { code: 'QB001', description: '고추장 10kg', unit: 'BOX' },
    { code: 'QB002', description: '참기름 1L', unit: 'BTL' },
    { code: 'QB003', description: '냉동 낙지 1kg', unit: 'PK' }
  ]);

  const [vendors, setVendors] = useState([
    { id: 1, name: '아산유통', alias: '아산식품, (주)아산' }
  ]);

  const [extractedItems, setExtractedItems] = useState([
    { id: 1, vendorItem: '아산유통고추장 대 용량', quantity: 2, unit: 'BOX', matchedCode: 'QB001', multiplier: 1, status: '학습 완료' },
    { id: 2, vendorItem: '아산유통참기름 오일', quantity: 12, unit: 'EA', matchedCode: '', multiplier: 1, status: '매칭 대기' }
  ]);

  // 새로운 데이터 입력 창을 위한 상태
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorAlias, setNewVendorAlias] = useState('');
  const [newQbCode, setNewQbCode] = useState('');
  const [newQbDesc, setNewQbDesc] = useState('');
  const [newQbUnit, setNewQbUnit] = useState('BOX');

  // --- 2. 핸들러 함수들 ---
  const handleFileUpload = (e) => {
    alert("파일이 선택되었습니다! (AI 데이터 추출 시뮬레이션 작동)");
  };

  const handleExcelUpload = (e) => {
    alert("엑셀 파일이 업로드되었습니다! (아이템 대량 등록 시뮬레이션)");
  };

  const addVendor = (e) => {
    e.preventDefault();
    if (!newVendorName) return;
    setVendors([...vendors, { id: Date.now(), name: newVendorName, alias: newVendorAlias }]);
    setNewVendorName('');
    setNewVendorAlias('');
    alert("벤더가 등록되었습니다!");
  };

  const addQbItem = (e) => {
    e.preventDefault();
    if (!newQbCode || !newQbDesc) return;
    setQbItems([...qbItems, { code: newQbCode, description: newQbDesc, unit: newQbUnit }]);
    setNewQbCode('');
    setNewQbDesc('');
    alert("퀵북 아이템이 추가되었습니다!");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 sm:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* 헤더 섹션 */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">QuickBooks Matcher</h1>
          <p className="text-slate-500 mt-2 text-sm">벤더 빌 매칭 및 단위 변환 자동 학습 시스템</p>
        </header>

        {/* 메인 4단 탭 구조 */}
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">1. 빌 매칭 검토</TabsTrigger>
            <TabsTrigger value="tab2">2. 벤더 등록</TabsTrigger>
            <TabsTrigger value="tab3">3. 벤더 명칭 관리</TabsTrigger>
            <TabsTrigger value="tab4">4. 퀵북 아이템 관리</TabsTrigger>
          </TabsList>

          {/* TAB 1: 빌 매칭 검토 */}
          <TabsContent value="tab1">
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">벤더 빌 파일 업로드</h2>
              <div className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl p-8 text-center cursor-pointer relative">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf" />
                <div className="text-slate-600 font-medium">영수증, 벤더 빌 이미지 또는 PDF 파일을 여기에 드래그하거나 클릭하세요</div>
                <div className="text-xs text-slate-400 mt-1">현재 시뮬레이션용 데이터 2건이 아래에 로드되어 있습니다.</div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">추출 데이터 및 퀵북 매칭 검토</h2>
              <p className="text-xs text-slate-400 mb-4">단위가 다를 경우 배수를 입력하여 퀵북 기준 수량으로 환산하세요.</p>
              
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse bg-white">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                      <th className="p-4">벤더 / 빌 품목명</th>
                      <th className="p-4">빌 수량 / 단위</th>
                      <th className="p-4">퀵북 아이템 매칭 (설명/코드)</th>
                      <th className="p-4">단위 변환 배수</th>
                      <th className="p-4">최종 퀵북 수량</th>
                      <th className="p-4">상태 및 저장</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {extractedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-900">{item.vendorItem}</td>
                        <td className="p-4 text-slate-600">{item.quantity} {item.unit}</td>
                        <td className="p-4">
                          <select value={item.matchedCode} onChange={(e) => {
                            const updated = extractedItems.map(i => i.id === item.id ? { ...i, matchedCode: e.target.value } : i);
                            setExtractedItems(updated);
                          }} className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500">
                            <option value="">-- 퀵북 아이템 선택 --</option>
                            {qbItems.map(qb => (
                              <option key={qb.code} value={qb.code}>{qb.description} ({qb.code}) [{qb.unit}]</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-400 text-xs">x</span>
                            <input type="number" value={item.multiplier} onChange={(e) => {
                              const updated = extractedItems.map(i => i.id === item.id ? { ...i, multiplier: Number(e.target.value) } : i);
                              setExtractedItems(updated);
                            }} className="w-16 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg p-1.5 text-center text-xs focus:outline-none" />
                          </div>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">
                          {item.quantity * item.multiplier} {qbItems.find(q => q.code === item.matchedCode)?.unit || item.unit}
                        </td>
                        <td className="p-4">
                          {item.status === '학습 완료' ? (
                            <span className="text-emerald-600 font-medium text-xs flex items-center">✓ 학습 완료</span>
                          ) : (
                            <button onClick={() => {
                              const updated = extractedItems.map(i => i.id === item.id ? { ...i, status: '학습 완료' } : i);
                              setExtractedItems(updated);
                              alert("매칭 규칙이 시스템에 저장 및 매핑 학습되었습니다.");
                            }} className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg px-3 py-1.5 text-xs font-medium shadow-sm transition-colors">매칭 학습 저장</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </TabsContent>

          {/* TAB 2: 벤더 등록 */}
          <TabsContent value="tab2">
            <div className="max-w-md">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">신규 신뢰 벤더 등록</h2>
              <form onSubmit={addVendor} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">벤더 정식 명칭</label>
                  <input type="text" placeholder="예: 아산유통" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">인식 대치 에일리어스 (쉼표 구분)</label>
                  <input type="text" placeholder="예: 아산식품, (주)아산" value={newVendorAlias} onChange={(e) => setNewVendorAlias(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-lg py-2.5 text-sm font-medium shadow-sm transition-colors">벤더 등록하기</button>
              </form>
            </div>
          </TabsContent>

          {/* TAB 3: 벤더 명칭 관리 */}
          <TabsContent value="tab3">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">벤더별 텍스트 별칭 (Alias) 매핑 리스트</h2>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                    <th className="p-4">정식 벤더명</th>
                    <th className="p-4">등록된 별칭들 (AI가 동일 회사로 인지하는 이름)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-medium text-slate-900">{v.name}</td>
                      <td className="p-4 text-slate-600">{v.alias}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* TAB 4: 퀵북 아이템 관리 */}
          <TabsContent value="tab4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-1 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-3">직접 단건 추가</h2>
                  <form onSubmit={addQbItem} className="space-y-3">
                    <input type="text" placeholder="아이템 코드 (예: QB004)" value={newQbCode} onChange={(e) => setNewQbCode(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none" />
                    <input type="text" placeholder="아이템 설명(명칭)" value={newQbDesc} onChange={(e) => setNewQbDesc(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none" />
                    <select value={newQbUnit} onChange={(e) => setNewQbUnit(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none">
                      <option value="BOX">BOX</option>
                      <option value="BTL">BTL (병)</option>
                      <option value="PK">PK (팩)</option>
                      <option value="BAG">BAG (포대)</option>
                      <option value="CAN">CAN (캔)</option>
                    </select>
                    <button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-lg py-2 text-xs font-medium transition-colors">아이템 추가</button>
                  </form>
                </div>
                
                <hr className="border-slate-100" />

                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-2">대량 엑셀 업로드 (.xlsx / .csv)</h2>
                  <p className="text-xs text-slate-400 mb-3">퀵북에서 내보낸 아이템 리스트 파일로 일괄 등록합니다.</p>
                  <div className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-lg p-4 text-center cursor-pointer relative text-xs text-slate-500">
                    <input type="file" onChange={handleExcelUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".xlsx,.csv" />
                    여기에 엑셀 파일을 드롭하세요
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">퀵북 마스터 아이템 목록 ({qbItems.length}건)</h2>
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500">
                        <th className="p-3">코드</th>
                        <th className="p-3">아이템 설명</th>
                        <th className="p-3">기준 단위</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                      {qbItems.map((qb) => (
                        <tr key={qb.code} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-900">{qb.code}</td>
                          <td className="p-3">{qb.description}</td>
                          <td className="p-3"><span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">{qb.unit}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
