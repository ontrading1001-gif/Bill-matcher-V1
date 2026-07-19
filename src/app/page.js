'use client';

import React, { useState } from 'react';
// 기본 탭 기능을 쓰기 위해 대치합니다.
const Tabs = ({ children, defaultValue }) => {
  const [v, setV] = React.useState(defaultValue);
  return <div className="w-full">{React.Children.map(children, c => React.cloneElement(c, { activeValue: v, setActiveValue: setV }))}</div>;
};
const TabsList = ({ children, activeValue, setActiveValue, className }) => <div className={className}>{React.Children.map(children, c => React.cloneElement(c, { activeValue, setActiveValue }))}</div>;
const TabsTrigger = ({ children, value, activeValue, setActiveValue, className }) => (
  <button onClick={() => setActiveValue(value)} className={`${className} ${activeValue === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{children}</button>
);
const TabsContent = ({ children, value, activeValue, className }) => activeValue === value ? <div className={className}>{children}</div> : null;

export default function Home() {
  // --- 1. 상태 관리 (State) ---
  // 퀵북 아이템 마스터 데이터 (초기 샘플 3개)
  const [qbItems, setQbItems] = useState([
    { code: 'QB001', description: '고추장 10kg', unit: 'BOX' },
    { code: 'QB002', description: '참기름 1L', unit: 'BTL' },
    { code: 'QB003', description: '냉동 낙지 1kg', unit: 'PK' }
  ]);

  // 벤더 목록 데이터
  const [vendors, setVendors] = useState([
    { id: 1, name: '아산유통', alias: '아산식품, (주)아산' },
    { id: 2, name: '백제상사', alias: '백제상사 주식회사' }
  ]);

  // 새로운 벤더 입력 양식
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorAlias, setNewVendorAlias] = useState('');

  // 퀵북 단건 추가 입력 양식
  const [newItemCode, setNewItemCode] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');

  // 1번 탭: 학습용 매칭 규칙 테이블 (단위 변환 및 학습 여부 저장)
  // key: "벤더명-빌품목명" 형태로 매칭 데이터를 저장합니다.
  const [learningRules, setLearningRules] = useState({
    '아산유통-고추장 대 용량': { qbCode: 'QB001', multiplier: 1, isLearned: true }
  });

  // 현재 업로드된 빌의 품목들 리스트 (가상 데이터)
  const [currentBillItems, setCurrentBillItems] = useState([
    { id: 1, vendor: '아산유통', invoiceItem: '고추장 대 용량', billUnit: 'BOX', qty: 2, price: 50000 },
    { id: 2, vendor: '아산유통', invoiceItem: '참기름 오일', billUnit: 'EA', qty: 12, price: 15000 }
  ]);

  // 화면에서 사용자가 임시로 수정한 매칭 값을 담는 테이블
  const [tempSelection, setTempSelection] = useState({
    1: { qbCode: 'QB001', multiplier: 1 },
    2: { qbCode: '', multiplier: 1 } // 참기름은 아직 미매칭 상태
  });

  // --- 2. 핸들러 함수 (Functions) ---
  
  // 벤더 추가
  const handleAddVendor = (e) => {
    e.preventDefault();
    if (!newVendorName) return;
    const newId = vendors.length + 1;
    setVendors([...vendors, { id: newId, name: newVendorName, alias: newVendorAlias }]);
    setNewVendorName('');
    setNewVendorAlias('');
    alert('벤더가 추가되었습니다.');
  };

  // 퀵북 아이템 단건 추가
  const handleAddQbItem = (e) => {
    e.preventDefault();
    if (!newItemCode || !newItemDesc || !newItemUnit) return;
    setQbItems([...qbItems, { code: newItemCode, description: newItemDesc, unit: newItemUnit }]);
    setNewItemCode('');
    setNewItemDesc('');
    setNewItemUnit('');
    alert('퀵북 아이템이 추가되었습니다.');
  };

  // 엑셀 업로드 시뮬레이션 (가짜 데이터 채워넣기)
  const handleExcelSimulation = () => {
    const mockExcelItems = [
      { code: 'QB004', description: '국산 쌀 20kg', unit: 'BAG' },
      { code: 'QB005', description: '식용유 18L', unit: 'CAN' }
    ];
    setQbItems([...qbItems, ...mockExcelItems]);
    alert('엑셀 파일(샘플 2건) 파싱 및 추가 완료!');
  };

  // 벤더빌 매칭 행에서 드롭다운이나 배수 변경 시
  const handleMatchChange = (billItemId, field, value) => {
    setTempSelection({
      ...tempSelection,
      [billItemId]: {
        ...tempSelection[billItemId],
        [field]: value
      }
    });
  };

  // [저장 및 학습 완료] 버튼 클릭 시
  const handleSaveAndLearn = (billItem) => {
    const currentSelect = tempSelection[billItem.id];
    if (!currentSelect || !currentSelect.qbCode) {
      alert('퀵북 아이템을 선택해주세요.');
      return;
    }

    // 규칙 키 생성 (예: "아산유통-참기름 오일")
    const ruleKey = `${billItem.vendor}-${billItem.invoiceItem}`;
    
    // 학습 데이터에 등록
    setLearningRules({
      ...learningRules,
      [ruleKey]: {
        qbCode: currentSelect.qbCode,
        multiplier: currentSelect.multiplier,
        isLearned: true
      }
    });

    alert(`[${billItem.invoiceItem}] 품목의 매칭 규칙이 시스템에 학습되었습니다!`);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">QuickBooks Matcher</h1>
          <p className="text-sm text-slate-500 mt-1">벤더빌 매칭 및 단위 변환 자동 학습 시스템</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 bg-slate-200 p-1 rounded-xl mb-6">
            <TabsTrigger value="upload" className="rounded-lg text-xs md:text-sm font-medium py-2.5">1. 빌 매칭 검토</TabsTrigger>
            <TabsTrigger value="add-vendor" className="rounded-lg text-xs md:text-sm font-medium py-2.5">2. 벤더 등록</TabsTrigger>
            <TabsTrigger value="manage-vendor" className="rounded-lg text-xs md:text-sm font-medium py-2.5">3. 벤더 명칭 관리</TabsTrigger>
            <TabsTrigger value="qb-items" className="rounded-lg text-xs md:text-sm font-medium py-2.5">4. 퀵북 아이템 관리</TabsTrigger>
          </TabsList>

          {/* ==================== 1번 탭: 빌 업로드 및 매칭 ==================== */}
          <TabsContent value="upload" className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 mb-2">벤더 빌 파일 업로드</h2>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                <p className="text-sm text-slate-600 font-medium">영수증, 벤더 빌 이미지 또는 PDF 파일을 여기에 드래그하거나 클릭하세요</p>
                <p className="text-xs text-slate-400 mt-1">현재는 시뮬레이션용 데이터 2건이 아래에 로드되어 있습니다.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900">추출 데이터 및 퀵북 매칭 검토</h3>
                <p className="text-xs text-slate-500 mt-0.5">단위가 다를 경우 배수를 입력하여 퀵북 기준 수량으로 환산하세요.</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 text-xs tracking-wider">
                      <th className="p-4">벤더 / 빌 품목명</th>
                      <th className="p-4">빌 수량 / 단위</th>
                      <th className="p-4">퀵북 아이템 매칭 (설명/코드)</th>
                      <th className="p-4">단위 변환 배수</th>
                      <th className="p-4">최종 퀵북 수량</th>
                      <th className="p-4 text-center">상태 및 저장</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentBillItems.map((item) => {
                      const ruleKey = `${item.vendor}-${item.invoiceItem}`;
                      const savedRule = learningRules[ruleKey];
                      const currentSelect = tempSelection[item.id] || { qbCode: '', multiplier: 1 };
                      
                      // 학습 정보 유무 판별
                      const isLearned = savedRule?.isLearned || false;
                      const activeQbCode = isLearned ? savedRule.qbCode : currentSelect.qbCode;
                      const activeMultiplier = isLearned ? savedRule.multiplier : currentSelect.multiplier;
                      const finalQty = item.qty * (Number(activeMultiplier) || 1);

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-4">
                            <span className="text-xs block text-slate-400 font-mono">{item.vendor}</span>
                            <span className="font-semibold text-slate-800">{item.invoiceItem}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium text-slate-700">{item.qty}</span>{' '}
                            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{item.billUnit}</span>
                          </td>
                          <td className="p-4">
                            <select 
                              className="w-full min-w-[200px] bg-white border border-slate-200 rounded px-2 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={activeQbCode}
                              disabled={isLearned}
                              onChange={(e) => handleMatchChange(item.id, 'qbCode', e.target.value)}
                            >
                              <option value="">-- 퀵북 아이템 선택 --</option>
                              {qbItems.map(qb => (
                                <option key={qb.code} value={qb.code}>
                                  {qb.description} ({qb.code}) [{qb.unit}]
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-slate-400">x</span>
                              <input 
                                type="number" 
                                className="w-16 border border-slate-200 rounded px-1.5 py-1 text-center bg-white shadow-sm"
                                value={activeMultiplier}
                                disabled={isLearned}
                                onChange={(e) => handleMatchChange(item.id, 'multiplier', e.target.value)}
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-blue-600">{finalQty}</span>{' '}
                            <span className="text-xs text-slate-400">
                              {qbItems.find(q => q.code === activeQbCode)?.unit || ''}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {isLearned ? (
                              <span className="inline-flex items-center bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                                ✓ 학습 완료
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleSaveAndLearn(item)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded shadow transition"
                              >
                                매칭 학습 저장
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* ==================== 2번 탭: 벤더 추가 페이지 ==================== */}
          <TabsContent value="add-vendor">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-xl mx-auto">
              <h2 className="text-xl font-bold text-slate-900 mb-4">새로운 벤더 등록</h2>
              <form onSubmit={handleAddVendor} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">벤더 정식 명칭</label>
                  <input 
                    type="text"
                    placeholder="예: 주식회사 아산유통"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">인식용 별칭 (쉼표로 구분)</label>
                  <input 
                    type="text"
                    placeholder="예: 아산유통, 아산식품, (주)아산"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white"
                    value={newVendorAlias}
                    onChange={(e) => setNewVendorAlias(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2 rounded-lg transition">
                  벤더 등록하기
                </button>
              </form>
            </div>
          </TabsContent>

          {/* ==================== 3번 탭: 벤더 명칭 관리 페이지 ==================== */}
          <TabsContent value="manage-vendor">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">등록된 벤더 및 별칭 리스트</h2>
                <p className="text-xs text-slate-400 mt-0.5">계산서에 적히는 다양한 별칭들을 정식 벤더 하나로 연결합니다.</p>
              </div>
              <div className="divide-y divide-slate-100">
                {vendors.map(v => (
                  <div key={v.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50">
                    <div>
                      <h4 className="font-bold text-slate-800">{v.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-400">매칭 키워드:</span> {v.alias || '등록된 별칭 없음'}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 mt-2 sm:mt-0 bg-slate-100 px-2 py-1 rounded font-mono">ID: {v.id}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ==================== 4번 탭: 퀵북 아이템 관리 ==================== */}
          <TabsContent value="qb-items" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* 개별 추가 폼 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-1">
                <h3 className="font-bold text-slate-900 mb-4">직접 단건 추가</h3>
                <form onSubmit={handleAddQbItem} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">아이템 코드</label>
                    <input 
                      type="text" placeholder="QB004" className="w-full border border-slate-200 rounded p-1.5 text-sm bg-white"
                      value={newItemCode} onChange={(e) => setNewItemCode(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">아이템 설명 (명칭)</label>
                    <input 
                      type="text" placeholder="국산 쌀 20kg" className="w-full border border-slate-200 rounded p-1.5 text-sm bg-white"
                      value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">기본 단위</label>
                    <input 
                      type="text" placeholder="BAG" className="w-full border border-slate-200 rounded p-1.5 text-sm bg-white"
                      value={newItemUnit} onChange={(e) => setNewItemUnit(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded transition">
                    아이템 추가
                  </button>
                </form>
              </div>

              {/* 엑셀 일괄 업로드 시뮬레이터 */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">대량 엑셀 업로드 (.xlsx / .csv)</h3>
                  <p className="text-xs text-slate-500 mb-4">퀵북에서 내보낸 아이템 리스트 엑셀 파일을 업로드하여 일괄 등록합니다.</p>
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50">
                    <p className="text-xs text-slate-600 font-medium mb-2">여기에 엑셀 파일을 드롭하세요</p>
                    <button 
                      onClick={handleExcelSimulation}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-1.5 rounded shadow-sm transition"
                    >
                      모의 엑셀 업로드 테스트 해보기
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-4 bg-amber-50 text-amber-800 p-2.5 rounded border border-amber-200">
                  ⚠️ 첫 열 헤더 기준: [코드], [설명], [단위] 순서의 템플릿 파일이 필요합니다.
                </div>
              </div>

            </div>

            {/* 퀵북 마스터 아이템 목록 테이블 */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">퀵북 마스터 아이템 목록 ({qbItems.length}건)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-100/50 text-slate-600 font-medium text-xs border-b border-slate-100">
                      <th className="p-3">코드</th>
                      <th className="p-3">아이템 설명</th>
                      <th className="p-3">기준 단위</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-xs">
                    {qbItems.map(item => (
                      <tr key={item.code} className="hover:bg-slate-50/50 text-slate-700">
                        <td className="p-3 font-bold text-slate-900">{item.code}</td>
                        <td className="p-3 font-sans text-sm">{item.description}</td>
                        <td className="p-3"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{item.unit}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </main>
  );
}
