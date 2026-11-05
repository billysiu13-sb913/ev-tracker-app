import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Home, PlusCircle, BarChart3, BatteryCharging, CarFront, Calendar, FileText, CheckCircle2, Trash2, Edit3, X, ClipboardCopy, TrendingUp, Zap, Download, Upload } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';

// 1. 初始化獨立的 Firebase
let app, auth, db;
let initError = false;

try {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (!apiKey || apiKey === "您的_API_KEY") {
    throw new Error("尚未設定正確的 .env 環境變數");
  }
  
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase 載入失敗:", error);
  initError = true;
}

const initialData = [
  { date: '2025-10-22', charge: 115, parking: 36, notes: '匯入紀錄' },
  { date: '2025-10-27', charge: 51, parking: 22, notes: '匯入紀錄' },
  { date: '2025-10-30', charge: 117, parking: 16, notes: '匯入紀錄' },
  { date: '2025-11-04', charge: 116, parking: 16, notes: '匯入紀錄' },
  { date: '2025-11-11', charge: 99, parking: 16, notes: '匯入紀錄' },
  { date: '2025-11-15', charge: 96, parking: 22, notes: '匯入紀錄' },
  { date: '2025-11-20', charge: 135, parking: 32, notes: '匯入紀錄' },
  { date: '2025-12-03', charge: 118, parking: 16, notes: '匯入紀錄' },
  { date: '2025-12-23', charge: 100, parking: 16, notes: '匯入紀錄' },
  { date: '2025-12-29', charge: 121, parking: 16, notes: '匯入紀錄' },
  { date: '2026-01-06', charge: 104, parking: 16, notes: '匯入紀錄' },
  { date: '2026-01-10', charge: 111, parking: 22, notes: '匯入紀錄' },
  { date: '2026-01-12', charge: 61.73, parking: 0, notes: '匯入紀錄' },
  { date: '2026-01-20', charge: 112, parking: 0, notes: '匯入紀錄' },
  { date: '2026-01-24', charge: 91, parking: 0, notes: '匯入紀錄' },
  { date: '2026-01-28', charge: 131, parking: 0, notes: '匯入紀錄' },
  { date: '2026-01-30', charge: 59, parking: 0, notes: '匯入紀錄' },
  { date: '2026-02-02', charge: 92, parking: 0, notes: '匯入紀錄' },
  { date: '2026-02-08', charge: 114, parking: 38, notes: '匯入紀錄' },
  { date: '2026-02-10', charge: 47, parking: 0, notes: '匯入紀錄' },
  { date: '2026-02-11', charge: 81, parking: 0, notes: '匯入紀錄' },
  { date: '2026-02-12', charge: 37, parking: 0, notes: '匯入紀錄' },
  { date: '2026-02-14', charge: 86, parking: 0, notes: '匯入紀錄' },
  { date: '2026-02-24', charge: 98, parking: 16, notes: '匯入紀錄' },
  { date: '2026-03-07', charge: 130, parking: 25, notes: '匯入紀錄' },
  { date: '2026-03-08', charge: 76, parking: 0, notes: '匯入紀錄' },
  { date: '2026-03-17', charge: 0, parking: 18, notes: '匯入紀錄' },
  { date: '2026-03-18', charge: 45, parking: 0, notes: '匯入紀錄' },
  { date: '2026-03-19', charge: 76, parking: 0, notes: '匯入紀錄' },
  { date: '2026-03-21', charge: 130, parking: 22, notes: '匯入紀錄' },
  { date: '2026-03-27', charge: 103, parking: 0, notes: '匯入紀錄' },
  { date: '2026-03-31', charge: 112, parking: 16, notes: '匯入紀錄' },
  { date: '2026-04-10', charge: 74, parking: 16, notes: '匯入紀錄' },
  { date: '2026-04-15', charge: 99, parking: 16, notes: '匯入紀錄' },
  { date: '2026-04-22', charge: 100, parking: 16, notes: '匯入紀錄' },
  { date: '2026-04-23', charge: 16, parking: 0, notes: '匯入紀錄' },
  { date: '2026-04-24', charge: 0, parking: 18, notes: '匯入紀錄' },
  { date: '2026-04-25', charge: 56, parking: 16, notes: '匯入紀錄' },
  { date: '2026-04-30', charge: 120, parking: 16, notes: '匯入紀錄' },
  { date: '2026-05-05', charge: 115, parking: 16, notes: '匯入紀錄' },
  { date: '2026-05-08', charge: 118, parking: 0, notes: '匯入紀錄' },
  { date: '2026-05-12', charge: 128, parking: 32, notes: '匯入紀錄' },
  { date: '2026-05-14', charge: 42, parking: 0, notes: '匯入紀錄' },
  { date: '2026-05-26', charge: 156, parking: 0, notes: '匯入紀錄' },
  { date: '2026-06-01', charge: 100, parking: 16, notes: '匯入紀錄' },
  { date: '2026-06-05', charge: 120, parking: 16, notes: '匯入紀錄' },
  { date: '2026-06-08', charge: 97, parking: 0, notes: '匯入紀錄' },
  { date: '2026-06-12', charge: 125, parking: 16, notes: '匯入紀錄' },
  { date: '2026-06-23', charge: 158, parking: 0, notes: '匯入紀錄' },
  { date: '2026-06-26', charge: 83, parking: 5, notes: '匯入紀錄' },
  { date: '2026-07-06', charge: 136, parking: 16, notes: '匯入紀錄' },
  { date: '2026-07-08', charge: 123, parking: 5, notes: '匯入紀錄' },
  { date: '2026-07-09', charge: 32.5, parking: 0, notes: '匯入紀錄' },
  { date: '2026-07-13', charge: 105.3, parking: 5, notes: '匯入紀錄' },
  { date: '2026-07-17', charge: 101, parking: 0, notes: '匯入紀錄' },
  { date: '2026-07-18', charge: 44, parking: 0, notes: '匯入紀錄' },
  { date: '2026-07-19', charge: 128, parking: 0, kwh: 0, notes: '匯入紀錄' },
  { date: '2026-07-20', charge: 79, parking: 0, notes: '匯入紀錄' },
  { date: '2026-08-20', charge: 136, parking: 16, kwh: 44, notes: '匯入紀錄' },
  { date: '2026-08-27', charge: 128, parking: 16, kwh: 50, notes: '匯入紀錄' },
  { date: '2026-09-02', charge: 0, parking: 30, kwh: 10, notes: '匯入紀錄' },
  { date: '2026-09-07', charge: 129, parking: 17, kwh: 50, notes: '匯入紀錄' },
  { date: '2026-09-17', charge: 123, parking: 17, kwh: 46, notes: '匯入紀錄' },
  { date: '2026-10-02', charge: 127, parking: 17, kwh: 49, notes: '匯入紀錄' },
  { date: '2026-10-14', charge: 109, parking: 17, kwh: 42, notes: '無備註' },
  { date: '2026-10-17', charge: 45, parking: 0, kwh: 15, notes: '無備註' },
  { date: '2026-10-31', charge: 134, parking: 23, kwh: 52, notes: '無備註' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null); 
  const [editingId, setEditingId] = useState(null); 
  const hasSeeded = useRef(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    charge: '',
    parking: '',
    kwh: '',
    notes: ''
  });

  useEffect(() => {
    if (initError) {
      setLoading(false);
      return;
    }
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (error) { console.error(error); setLoading(false); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const recordsRef = collection(db, 'my_ev_records');

    const unsubscribe = onSnapshot(recordsRef, (snapshot) => {
     if (snapshot.empty && !hasSeeded.current && initialData.length > 0) {
       hasSeeded.current = true;
       Promise.all(initialData.map((item, index) => {
         const importDocRef = doc(db, 'my_ev_records', `import_v1_${index}`);
         return setDoc(importDocRef, {
           date: item.date,
           charge: item.charge,
           parking: item.parking,
           total: item.charge + item.parking,
           kwh: item.kwh || 0, 
           notes: item.notes || '',
           createdAt: new Date().toISOString()
         });
       })).catch(console.error);
     } else {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecords(data);
        setLoading(false);
      }
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddRecord = async (e) => {
    e.preventDefault();
    if (!user) return;

    const chargeVal = parseFloat(formData.charge) || 0;
    const parkingVal = parseFloat(formData.parking) || 0;
    const kwhVal = parseFloat(formData.kwh) || 0; 
    
    if (chargeVal === 0 && parkingVal === 0 && kwhVal === 0) return;

    if (!editingId) {
      const isDuplicate = records.some(r => 
        r.date === formData.date && (r.charge || 0) === chargeVal && (r.parking || 0) === parkingVal
      );
      if (isDuplicate) {
        setSuccessMessage('⚠️ 發現同日相同金額紀錄，已自動為您攔截！');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 4000);
        return; 
      }
    }

    const recordData = {
      date: formData.date,
      charge: chargeVal,
      parking: parkingVal,
      total: chargeVal + parkingVal,
      kwh: kwhVal,
      notes: formData.notes,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        const docRef = doc(db, 'my_ev_records', editingId);
        await updateDoc(docRef, recordData);
        setSuccessMessage('紀錄已成功更新！');
      } else {
        recordData.createdAt = new Date().toISOString();
        const recordsRef = collection(db, 'my_ev_records');
        await addDoc(recordsRef, recordData); 
        setSuccessMessage('紀錄已安全儲存至專屬雲端！');
      }
      
      setShowSuccess(true);
      resetForm();
      setTimeout(() => setShowSuccess(false), 3000);
      setActiveTab('dashboard'); 
    } catch (error) {
      console.error("儲存到雲端失敗: ", error);
    }
  };

  const handleEditClick = (record) => {
    setFormData({
      date: record.date,
      charge: record.charge === 0 ? '' : record.charge.toString(),
      parking: record.parking === 0 ? '' : record.parking.toString(),
      kwh: record.kwh ? record.kwh.toString() : '',
      notes: record.notes || ''
    });
    setEditingId(record.id);
    setActiveTab('add');
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId || !user) return;
    try {
      const docRef = doc(db, 'my_ev_records', deleteConfirmId);
      await deleteDoc(docRef);
      setDeleteConfirmId(null);
      setSuccessMessage('紀錄已成功刪除！');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("刪除失敗: ", error);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      charge: '',
      parking: '',
      kwh: '',
      notes: ''
    });
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    resetForm();
    setActiveTab('dashboard');
  };

  // --- 全新：CSV 匯出功能 ---
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ['日期', '充電費用(HKD)', '泊車費用(HKD)', '總計(HKD)', '電量(kWh)', '備註'];
    const csvRows = records.map(r => {
      // 處理備註裡的換行或引號，避免破壞 CSV 格式
      const safeNotes = r.notes ? `"${r.notes.replace(/"/g, '""')}"` : '';
      return [r.date, r.charge || 0, r.parking || 0, r.total || 0, r.kwh || 0, safeNotes].join(',');
    });
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    // 加入 BOM 標籤 \uFEFF 讓 Excel 可以正確識別中文字
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EV_Records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessMessage('Excel (CSV) 已成功匯出！');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

// --- 全新：CSV 匯入功能 (已加入防重複機制) ---
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 安全的 CSV 解析器
    const parseCSVRow = (rowStr) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < rowStr.length; i++) {
        if (rowStr[i] === '"') {
          inQuotes = !inQuotes;
        } else if (rowStr[i] === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += rowStr[i];
        }
      }
      result.push(current);
      return result.map(s => s.trim().replace(/^"|"$/g, '')); 
    };

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) {
        alert("檔案內容為空或格式不符！");
        return; 
      }

      const newRecords = [];
      let skippedCount = 0; // 用來計算跳過了幾筆重複資料

      for (let i = 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]);
        if (!row || row.length < 5) continue; 
        
        const rawDate = row[0];
        const charge = parseFloat(row[1]) || 0;
        const parking = parseFloat(row[2]) || 0;
        const kwh = parseFloat(row[4]) || 0; 
        const notes = row[5] || '';          
        
        if (!rawDate) continue;
        
        // 修正 Excel 日期格式
        let formattedDate = rawDate;
        if (rawDate.includes('/')) {
          const parts = rawDate.split('/');
          if (parts.length === 3) {
            if (parts[2].length === 4) { // D/M/YYYY
              formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else if (parts[0].length === 4) { // YYYY/M/D
              formattedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            }
          }
        }
        
        if (formattedDate && formattedDate.length >= 8) {
          // 【核心修正：防重複檢查】
          // 1. 檢查雲端現有紀錄是否已存在相同日期與金額
          const isExistInDB = records.some(r => 
            r.date === formattedDate && (r.charge || 0) === charge && (r.parking || 0) === parking
          );
          // 2. 檢查這次匯入清單中是否已經重複
          const isExistInBatch = newRecords.some(r => 
            r.date === formattedDate && r.charge === charge && r.parking === parking
          );

          if (isExistInDB || isExistInBatch) {
            skippedCount++; // 發現重複，跳過不處理
          } else {
            newRecords.push({ date: formattedDate, charge, parking, total: charge + parking, kwh, notes });
          }
        }
      }

      if (newRecords.length > 0) {
        setLoading(true);
        try {
          await Promise.all(newRecords.map(item => {
             return addDoc(collection(db, 'my_ev_records'), {
               ...item,
               createdAt: new Date().toISOString()
             });
          }));
          
          let msg = `成功匯入 ${newRecords.length} 筆新紀錄！`;
          if (skippedCount > 0) msg += ` (自動攔截 ${skippedCount} 筆重複資料)`;
          setSuccessMessage(msg);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
          console.error("匯入失敗:", error);
          alert("匯入失敗，請檢查網路連線。");
        }
        setLoading(false);
      } else {
        if (skippedCount > 0) {
          setSuccessMessage(`攔截成功：檔案中的紀錄都已經存在了，沒有重複新增。`);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 4000);
        } else {
          alert("找不到可匯入的新數據，請確認日期格式。");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 重置 input
  };

  const handleExportToNotes = () => {
    if (records.length === 0) return;
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const sortedRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));

    const groups = {};
    sortedRecords.forEach(r => {
      const key = r.date.substring(0, 7);
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    let out = "EV-Charge\n\n";
    const groupKeys = Object.keys(groups).sort();
    
    groupKeys.forEach((key, index) => {
      const monthRecs = groups[key];
      const monthIndex = parseInt(key.split('-')[1], 10) - 1;
      const monthName = monthNames[monthIndex]; 

      let monthTotalsStr = [];
      let monthSum = 0;

      monthRecs.forEach(r => {
        const day = parseInt(r.date.split('-')[2], 10);
        const c = parseFloat(r.charge.toFixed(2));
        const p = parseFloat(r.parking.toFixed(2));
        const t = parseFloat(r.total.toFixed(2));

        out += `${day}-${monthName} ${c}+${p}=${t}\n`;
        monthTotalsStr.push(t);
        monthSum += t;
      });

      const formattedSum = parseFloat(monthSum.toFixed(2));
      out += `${monthName} Total\n`;
      out += `${monthTotalsStr.join('+')}=${formattedSum}\n`;
      if (index < groupKeys.length - 1) out += "\n";
    });

    const textArea = document.createElement("textarea");
    textArea.value = out;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      setSuccessMessage('格式已複製！可直接貼上至備忘錄。');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      console.error('複製失敗:', err);
    }
    document.body.removeChild(textArea);
  };

  const stats = useMemo(() => {
    let totalCharge = 0, totalParking = 0, totalSpend = 0, totalKwh = 0;
    
    records.forEach(r => {
      totalCharge += (r.charge || 0);
      totalParking += (r.parking || 0);
      totalSpend += (r.total || 0);
      totalKwh += (r.kwh || 0);
    });

    const monthlyGroups = {};
    records.forEach(r => {
      const year = r.date.substring(2, 4);
      const month = r.date.substring(5, 7);
      const displayMonth = `${year}年${month}月`;
      const sortKey = r.date.substring(0, 7);
      
      if (!monthlyGroups[sortKey]) {
        monthlyGroups[sortKey] = { sortKey, displayMonth, charge: 0, parking: 0, total: 0, count: 0, kwh: 0 };
      }
      monthlyGroups[sortKey].charge += (r.charge || 0);
      monthlyGroups[sortKey].parking += (r.parking || 0);
      monthlyGroups[sortKey].total += (r.total || 0);
      monthlyGroups[sortKey].kwh += (r.kwh || 0);
      monthlyGroups[sortKey].count += 1;
    });

    const monthlyData = Object.values(monthlyGroups).sort((a, b) => b.sortKey.localeCompare(a.sortKey));
    return { totalCharge, totalParking, totalSpend, totalKwh, monthlyData };
  }, [records]);

  const chartData = useMemo(() => {
    if (stats.monthlyData.length === 0) return null;
    const data = [...stats.monthlyData].reverse().slice(-12);
    const maxTotal = Math.max(...data.map(d => d.total), 100); 
    const viewBoxWidth = 400, viewBoxHeight = 220, paddingX = 30, paddingTop = 40, paddingBottom = 30;
    const innerWidth = viewBoxWidth - paddingX * 2, innerHeight = viewBoxHeight - paddingTop - paddingBottom;
    const stepX = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;

    const points = data.map((d, i) => {
      const x = paddingX + i * stepX;
      const y = paddingTop + innerHeight - ((d.total / maxTotal) * innerHeight);
      const monthLabel = parseInt(d.sortKey.substring(5, 7), 10) + '月';
      return { x, y, value: Math.round(d.total), label: monthLabel };
    });

    const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    const areaD = points.length > 0 
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`
      : '';

    return { points, pathD, areaD, maxTotal, viewBoxWidth, viewBoxHeight };
  }, [stats.monthlyData]);

  if (initError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-sm"><X className="w-8 h-8" /></div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">缺少 Firebase 設定</h2>
        <p className="text-slate-600 mb-6 text-sm">請確認 .env 檔案並重啟伺服器。</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="font-medium text-slate-600">正在連接專屬雲端空間...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20 md:pb-8 relative">
      
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 mx-auto"><Trash2 className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold text-center text-slate-800 mb-2">確定要刪除？</h3>
            <p className="text-slate-500 text-sm text-center mb-6">這筆紀錄刪除後將無法復原。</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition">取消</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition shadow-sm">確認刪除</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CarFront className="w-6 h-6" />
            <h1 className="text-xl font-bold tracking-wide">EV 充電紀錄</h1>
          </div>
          {user && (
            <div className="text-xs bg-blue-700 px-2 py-1 rounded-full opacity-80 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>已連線
            </div>
          )}
        </div>
      </header>

      {showSuccess && (
        <div className="max-w-md mx-auto px-4 mt-4 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-green-100 text-green-800 p-3 rounded-xl flex items-center shadow-sm border border-green-200">
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-600 flex-shrink-0" />
            <span className="font-medium text-sm">{successMessage}</span>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto p-4">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-sm font-medium text-slate-500">歷史總花費 (HKD)</h2>
                {stats.totalKwh > 0 && (
                  <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                    總平均 ${(stats.totalSpend / stats.totalKwh).toFixed(2)} / kWh
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold text-slate-800 mb-4">${stats.totalSpend.toFixed(1)}</div>
              
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                <div>
                  <div className="text-[11px] text-slate-400 flex items-center"><BatteryCharging className="w-3 h-3 mr-1"/> 充電</div>
                  <div className="font-semibold text-blue-600">${stats.totalCharge.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 flex items-center"><CarFront className="w-3 h-3 mr-1"/> 泊車</div>
                  <div className="font-semibold text-orange-500">${stats.totalParking.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 flex items-center"><Zap className="w-3 h-3 mr-1"/> 電量</div>
                  <div className="font-semibold text-yellow-500">{stats.totalKwh.toFixed(1)} kWh</div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-700 mt-6 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-slate-400" /> 所有紀錄 ({records.length})
            </h3>
            
            {records.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3"><FileText className="w-8 h-8 text-slate-300" /></div>
                <p className="text-slate-500 font-medium">尚未有任何紀錄</p>
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-700 flex items-center">
                          {record.date}
                          {record.kwh > 0 && (
                            <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded flex items-center">
                              <Zap className="w-2.5 h-2.5 mr-0.5"/> {record.kwh} kWh
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">{record.notes || '無備註'}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-slate-800">${record.total}</div>
                        <div className="text-xs text-slate-500 mt-1">充 ${record.charge} | 泊 ${record.parking}</div>
                        {record.kwh > 0 && (
                          <div className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                            均價: ${(record.total / record.kwh).toFixed(2)} / kWh
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-50">
                      <button onClick={() => handleEditClick(record)} className="flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"><Edit3 className="w-3.5 h-3.5 mr-1" /> 修改</button>
                      <button onClick={() => setDeleteConfirmId(record.id)} className="flex items-center text-xs font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"><Trash2 className="w-3.5 h-3.5 mr-1" /> 刪除</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? '修改充電紀錄' : '新增充電紀錄'}</h2>
              {editingId && <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 rounded-full"><X className="w-5 h-5" /></button>}
            </div>
            
            <form onSubmit={handleAddRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center"><Calendar className="w-4 h-4 mr-1"/> 日期</label>
                <input type="date" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center"><BatteryCharging className="w-4 h-4 mr-1 text-blue-500"/> 充電費用</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400">$</span>
                    <input type="number" min="0" step="0.1" className="w-full p-3 pl-7 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="0.0" value={formData.charge} onChange={(e) => setFormData({...formData, charge: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center"><CarFront className="w-4 h-4 mr-1 text-orange-500"/> 泊車費用</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-400">$</span>
                    <input type="number" min="0" step="0.1" className="w-full p-3 pl-7 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="0.0" value={formData.parking} onChange={(e) => setFormData({...formData, parking: e.target.value})} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center"><Zap className="w-4 h-4 mr-1 text-yellow-500"/> 充電度數 (kWh)</label>
                <div className="relative">
                  <input type="number" min="0" step="0.1" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="例如: 35.5" value={formData.kwh} onChange={(e) => setFormData({...formData, kwh: e.target.value})} />
                  <span className="absolute right-4 top-3 text-slate-400 text-sm">kWh</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1 flex items-center"><FileText className="w-4 h-4 mr-1"/> 地點/備註</label>
                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="例如：科學園超充" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
              </div>
              <button type="submit" className={`w-full mt-6 text-white font-bold py-4 rounded-xl shadow-md flex justify-center items-center ${editingId ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingId ? <Edit3 className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
                {editingId ? '更新紀錄' : '儲存至專屬雲端'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {chartData && chartData.points.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                <div className="flex items-center mb-4 text-slate-800"><TrendingUp className="w-5 h-5 mr-2 text-blue-500" /><h3 className="font-bold text-lg">近 12 個月花費趨勢</h3></div>
                <div className="w-full overflow-hidden relative" style={{ paddingTop: '10px' }}>
                  <svg viewBox={`0 0 ${chartData.viewBoxWidth} ${chartData.viewBoxHeight}`} className="w-full h-auto drop-shadow-sm overflow-visible">
                    <defs>
                      <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient>
                    </defs>
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (<line key={idx} x1="20" y1={40 + (220 - 40 - 30) * ratio} x2="380" y2={40 + (220 - 40 - 30) * ratio} stroke="#f1f5f9" strokeWidth="1" />))}
                    {chartData.points.length > 1 && <path d={chartData.areaD} fill="url(#gradientArea)" />}
                    <path d={chartData.pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {chartData.points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2" />
                        <text x={p.x} y={p.y - 12} textAnchor="middle" fill="#475569" fontSize="11" fontWeight="bold">${p.value}</text>
                        <text x={p.x} y={chartData.viewBoxHeight - 10} textAnchor="middle" fill="#94a3b8" fontSize="11">{p.label}</text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            )}

            {/* --- 新增：資料管理區塊 (CSV 匯出/匯入) --- */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-slate-400" /> 資料管理
                </h3>
                <button onClick={handleExportToNotes} className="flex items-center text-indigo-600 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition border border-indigo-100">
                  <ClipboardCopy className="w-3.5 h-3.5 mr-1" /> 備忘錄
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={handleExportCSV} className="flex items-center justify-center bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-green-100 transition border border-green-100">
                  <Download className="w-4 h-4 mr-2" /> 匯出 CSV
                </button>
                <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleImportCSV} />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm font-bold shadow-sm hover:bg-blue-100 transition border border-blue-100">
                  <Upload className="w-4 h-4 mr-2" /> 匯入 CSV
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-3">匯入的 CSV 將會直接附加到目前的紀錄中。</p>
            </div>

            <div className="flex justify-between items-center mb-2 mt-2">
              <h2 className="text-xl font-bold text-slate-800">每月統計報表</h2>
            </div>
            
            {records.length === 0 ? (
               <div className="text-center py-10 text-slate-400 bg-white rounded-2xl border border-slate-100">暫無數據可供統計。</div>
            ) : (
              <div className="space-y-4">
                {stats.monthlyData.map((monthData) => (
                  <div key={monthData.sortKey} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3">
                      <h3 className="text-lg font-bold text-slate-700">{monthData.displayMonth}</h3>
                      <div className="text-right">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium mr-2">共 {monthData.count} 次</span>
                        {monthData.kwh > 0 && <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium">⚡ {monthData.kwh.toFixed(1)} kWh</span>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-end text-sm">
                        <span className="text-slate-500 mb-0.5">當月總花費</span>
                        <div className="text-right">
                          <div className="font-bold text-slate-800 text-lg">${monthData.total.toFixed(1)}</div>
                          {monthData.kwh > 0 && <div className="text-[11px] text-indigo-600 font-medium mt-0.5">平均 ${(monthData.total / monthData.kwh).toFixed(2)} / kWh</div>}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                        <div className="bg-blue-500 h-2" style={{ width: `${monthData.total === 0 ? 0 : (monthData.charge / monthData.total) * 100}%` }}></div>
                        <div className="bg-orange-400 h-2" style={{ width: `${monthData.total === 0 ? 0 : (monthData.parking / monthData.total) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 pt-1">
                        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>充電 ${monthData.charge.toFixed(1)}</span>
                        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-orange-400 mr-1"></span>泊車 ${monthData.parking.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:relative md:border-t-0 md:shadow-none md:bg-transparent">
        <div className="max-w-md mx-auto flex justify-around p-2 md:bg-white md:rounded-2xl md:shadow-sm md:border md:border-slate-100 md:mt-6">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><Home className="w-6 h-6 mb-1" /><span className="text-[10px] font-medium">總覽</span></button>
          <button onClick={() => { resetForm(); setActiveTab('add'); }} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'add' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><div className={`p-3 rounded-full mb-1 mt(-4) transition-transform ${activeTab === 'add' ? 'bg-blue-100 text-blue-600 scale-110' : 'bg-slate-50 text-slate-400'}`}><PlusCircle className="w-6 h-6" /></div><span className="text-[10px] font-medium">新增</span></button>
          <button onClick={() => setActiveTab('summary')} className={`flex flex-col items-center p-2 rounded-xl transition-colors ${activeTab === 'summary' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><BarChart3 className="w-6 h-6 mb-1" /><span className="text-[10px] font-medium">統計</span></button>
        </div>
      </nav>
    </div>
  );
}