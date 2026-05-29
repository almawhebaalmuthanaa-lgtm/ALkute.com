/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  FolderPlus, 
  AlertTriangle, 
  CheckCircle, 
  ChevronLeft, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { OfficialLetter, LetterCategory } from '../types';
import { SYSTEM_CURRENT_DATE, getLetterExpiryStatus } from '../data/mockData';

interface LettersArchiveProps {
  letters: OfficialLetter[];
  onAddLetter: (newLetter: OfficialLetter) => void;
  setActiveTab: (tab: string) => void;
}

export default function LettersArchive({ 
  letters, 
  onAddLetter,
  setActiveTab
}: LettersArchiveProps) {
  
  // حالات الفلترة والبحث
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // حالات كتاب الأرشيف الإداري الجديد
  const [formNumber, setFormNumber] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSource, setFormSource] = useState('وزارة التعليم العالي والبحث العلمي');
  const [formDestination, setFormDestination] = useState('رئاسة الجامعة الأهلية / مركز التسجيل');
  const [formIssued, setFormIssued] = useState('2026-05-10');
  const [formExpiry, setFormExpiry] = useState('2026-12-31'); // تاريخ انتهاء الصلاحية للقرار
  const [formCategory, setFormCategory] = useState<LetterCategory>('ministry_directive');
  const [formSummary, setFormSummary] = useState('');
  const [formFileName, setFormFileName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // معالجة حفظ الكتاب الرسمي
  const handleSaveLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNumber || !formTitle || !formExpiry) {
      alert('الرجاء تعبئة الحقول الأساسية: الرقم الإداري، موضوع الكتاب وتحديد تاريخ انتهاء الصلاحية!');
      return;
    }

    const generatedId = `LET-2026-000${letters.length + 1}`;
    
    // حساب حالة الصلاحية ديناميكياً بناءً على تاريخ الصلاحية المدخل نسبةً لتاريخ النظام السيرفر الحالي
    const targetStatus = getLetterExpiryStatus(formExpiry);

    const newLetter: OfficialLetter = {
      id: generatedId,
      letterNumber: formNumber,
      title: formTitle,
      source: formSource,
      destination: formDestination,
      dateIssued: formIssued,
      dateReceived: SYSTEM_CURRENT_DATE,
      expiryDate: formExpiry,
      category: formCategory,
      summary: formSummary,
      attachedFileName: formFileName || `letter_attachment_${generatedId.toLowerCase()}.pdf`,
      archivedBy: 'سمير عبيد الصرخي - رئيس الأرشيف المركزي',
      status: targetStatus
    };

    onAddLetter(newLetter);
    setFormNumber('');
    setFormTitle('');
    setFormSummary('');
    setFormFileName('');
    setShowAddForm(false);
    setSuccessMsg('✔ تم إيداع الكتاب الرسمي في الأرشيف المركزي بنظام تتبع الصلاحيات!');

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // تصفية وقنبلة البحث للكتب المؤرشفة
  const filteredLetters = letters.filter(letter => {
    // حساب حالة تجديد الصلاحية في نفس اللحظة للتأكيد
    const currentStatus = getLetterExpiryStatus(letter.expiryDate);

    const matchesSearch = letter.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          letter.letterNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          letter.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          letter.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || letter.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 text-right">

      {/* مقدمة الرأس لمكتب وأرشيف القيود */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">الأرشيف المركزي والكتب والتعميمات الرسمية</h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">تداول وأرشفة الأوامر الإدارية والوزارية وتثبيت فترات نفاذ القوانين</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-univ-blue hover:bg-slate-800 text-white font-bold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
        >
          {showAddForm ? <Clock className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
          <span>{showAddForm ? 'معاينة القائمة' : 'أرشفة وثيقة رسمية جديدة'}</span>
        </button>
      </div>

      {/* نجاح الإرسال */}
      {successMsg && (
        <div className="bg-emerald-100 border border-emerald-250 text-emerald-800 font-bold p-3 rounded-xl text-center text-xs animate-bounce shadow-xs">
          {successMsg}
        </div>
      )}

      {/* استمارة ومطبعة الكتب الرسمية المؤرشفة (New Official Letter Input Form) */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md animate-fade-in space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-univ-blue">
            <FolderPlus className="w-5 h-5 text-univ-blue" />
            <h3 className="font-bold text-slate-800 text-base">بوابة تسجيل وثيقة إدارية أو أمر وزاري جديد</h3>
          </div>

          <form onSubmit={handleSaveLetter} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* رقم الكتاب الإداري */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">رقم وتاريخ الصادر الإداري المستمر *</label>
                <input 
                  type="text" 
                  placeholder="مثال: م ت / ق ت / 9032"
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-3 rounded-lg outline-hidden text-slate-800 font-mono text-center font-bold"
                  required
                />
              </div>

              {/* موضوع الوثيقة */}
              <div className="space-y-1.5 text-xs md:col-span-2">
                <label className="font-bold text-slate-700 block">موضوع الكتاب الرسمي / الغرض الإداري *</label>
                <input 
                  type="text" 
                  placeholder="مثال: تعليمات منح تمديد تسجيل خفجي الصلاحية في الأقسام الطبية"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-3 rounded-lg outline-hidden text-slate-800 font-bold"
                  required
                />
              </div>

              {/* الجهة الصادرة */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">الجهة الصادرة (المصدر للكتاب):</label>
                <input 
                  type="text" 
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-2.5 rounded-lg outline-hidden text-slate-800"
                />
              </div>

              {/* الجهة الموجه إليها */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">الجهة الوارد إليها / الموجه لها المباشرة:</label>
                <input 
                  type="text" 
                  value={formDestination}
                  onChange={(e) => setFormDestination(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-2.5 rounded-lg outline-hidden text-slate-800"
                />
              </div>

              {/* تصنيف الكتاب */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">تصنيف وقانونية المستند:</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as LetterCategory)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800 font-bold cursor-pointer"
                >
                  <option value="ministry_directive">كتاب وزاري سيادي (وزارة التعليم العالي)</option>
                  <option value="administrative_order">أمر إداري جامعي (رئاسة الجامعة)</option>
                  <option value="internal_circular">تعميم وقرار داخلي للأقسام</option>
                  <option value="student_excuse">عذر طبي أو إجازة معلّقة لطالب</option>
                  <option value="graduation_order">أمر تخرج والمنح الدراسية</option>
                </select>
              </div>

              {/* تاريخ الصدور وحب الصلاحية لانتهاء (REQUIRED METADATA CALENDARS) */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">تاريخ الصدور الرسمي للوثيقة:</label>
                <input 
                  type="date" 
                  value={formIssued}
                  onChange={(e) => setFormIssued(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-800"
                />
              </div>

              {/* تاريخ انتهاء الصلاحية (Critically important feature - Expiration Limit) */}
              <div className="space-y-1.5 text-xs bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                <label className="font-bold text-red-800 block flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>تاريخ انتهاء الصلاحية/العمل بالقرار *</span>
                </label>
                <input 
                  type="date" 
                  value={formExpiry}
                  onChange={(e) => setFormExpiry(e.target.value)}
                  className="w-full bg-white border border-red-200 p-2 rounded-lg text-red-900 font-bold"
                  required
                />
              </div>

              {/* اسم المرفق الرقمي للتخزين المحاكي */}
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700 block">اسم الملف الرقمي المرفق (PDF):</label>
                <input 
                  type="text" 
                  placeholder="مثال: scholarship_directive_order.pdf"
                  value={formFileName}
                  onChange={(e) => setFormFileName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-2.5 rounded-lg outline-hidden text-slate-800 font-mono"
                />
              </div>

            </div>

            {/* الحاشية والملخص والنص البريدي */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 block">خلاصة نص المستند والتعليمات الملزمة (Summary):</label>
              <textarea 
                rows={3}
                placeholder="المضمون الهام للكتاب: تقرر فتح باب نقل الطلاب السحابي، ووجوب تحديث دورة التدقيق قبل تاریخ..."
                value={formSummary}
                onChange={(e) => setFormSummary(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue focus:bg-white p-3 rounded-lg outline-hidden text-slate-800 leading-relaxed"
                required
              ></textarea>
            </div>

            <div className="flex gap-4 justify-end pt-2">
              <button 
                type="submit" 
                className="bg-univ-blue hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                إيداع وأرشفة المستند إلكترونياً
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                إلغاء الأمر
              </button>
            </div>

          </form>
        </div>
      )}

      {/* فلاتر البحث في الأرشيف المركزي */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3">
        
        {/* شريط البحث الموجه */}
        <div className="relative flex-grow">
          <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث برقم المعاملة، عنوان القرار، المضمون، أو دائرة الصادر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-univ-blue pr-10 pl-4 py-2.5 rounded-xl text-xs outline-hidden text-slate-800"
          />
        </div>

        {/* فرز تصنيف المستند */}
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 font-bold cursor-pointer"
        >
          <option value="all">كل تصانيف الأرشيف</option>
          <option value="ministry_directive">كتاب وزاري حكومي</option>
          <option value="administrative_order">أمر إداري رئاسي</option>
          <option value="internal_circular">تعميمات الأقسام</option>
          <option value="student_excuse">أعذار الطلبة المرضية</option>
          <option value="graduation_order">أوامر التخرج</option>
        </select>

        {/* فرز صلاحية القرار (فكرة هامة لمراقبة الصلاحيات) */}
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700 font-bold cursor-pointer"
        >
          <option value="all">كل حالات سريان الصلاحية</option>
          <option value="active">نشط وساري المفعول</option>
          <option value="expiring_soon">ينتهي قريباً جداً (⏳)</option>
          <option value="expired">منتهي الصلاحية وملغي (🔴)</option>
        </select>

      </div>

      {/* شبكة بصرية للكتب المؤرشفة والقرارات الملحومة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredLetters.map((letItem) => {
          // حساب صلاحية الكتاب بشكل فوري ميمو لتحديث الحالات تلقائياً
          const currentStatus = getLetterExpiryStatus(letItem.expiryDate);
          
          return (
            <div 
              key={letItem.id}
              className={`p-5 bg-white rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between gap-4 relative overflow-hidden ${
                currentStatus === 'expired' ? 'border-red-200 shadow-red-50/50' :
                currentStatus === 'expiring_soon' ? 'border-amber-200 shadow-amber-50/50' : 'border-slate-100'
              }`}
            >
              {/* هيد بطاقة المستند */}
              <div>
                
                {/* وسم فحص الصلاحية الرأسي ليكون واضحاً جداً */}
                <div className="flex justify-between items-start gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    letItem.category === 'ministry_directive' ? 'bg-indigo-50 text-indigo-800 border border-indigo-100' :
                    letItem.category === 'administrative_order' ? 'bg-sky-50 text-sky-800 border border-sky-100' :
                    'bg-slate-50 text-slate-700 border border-slate-100'
                  }`}>
                    {letItem.category === 'ministry_directive' ? 'كتاب وزاري' :
                     letItem.category === 'administrative_order' ? 'أمر إداري' :
                     letItem.category === 'internal_circular' ? 'تعميم أقسام' : 'معاملة رسمية'}
                  </span>
                  
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                    currentStatus === 'expired' ? 'bg-red-100 text-red-800' :
                    currentStatus === 'expiring_soon' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {currentStatus === 'expired' ? <ShieldAlert className="w-3.5 h-3.5 text-red-700" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    <span>
                      {currentStatus === 'expired' ? 'منتهي/ملغي' :
                       currentStatus === 'expiring_soon' ? 'ينتهي قريباً!' : 'سار وصالح قانونياً'}
                    </span>
                  </span>
                </div>

                <div className="space-y-1.5 mt-3 text-right">
                  <div className="font-mono text-slate-400 text-[10px] md:text-xs">
                    كود الحفظ: {letItem.id} • إداري: <span className="font-bold text-slate-750">{letItem.letterNumber}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-sm leading-snug line-clamp-1 hover:text-univ-blue transition-colors cursor-pointer" title={letItem.title}>
                    {letItem.title}
                  </h4>
                </div>

                {/* نص الخلاصة المودع */}
                <p className="text-slate-500 text-xs mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 line-clamp-3">
                  {letItem.summary}
                </p>

              </div>

              {/* الفوتر وتوضيح الصادر والوارد مع تدوين تاريخ الانتهاء */}
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 Text-xs">
                
                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>صادر عن: <span className="font-bold text-slate-700">{letItem.source}</span></span>
                  <span>موجه إلى: <span className="font-bold text-slate-705 truncate max-w-[150px] inline-block align-bottom">{letItem.destination}</span></span>
                </div>

                {/* تاريخ انتهاء الصلاحية والملف المرفق */}
                <div className="flex justify-between items-center bg-slate-50/50 p-1.5 rounded-lg text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1 font-bold text-red-800">
                    <Calendar className="w-3.5 h-3.5 text-red-650" />
                    <span>تاريخ انتهاء الصلاحية: {letItem.expiryDate || 'مفتوح للعمل'}</span>
                  </div>
                  {letItem.attachedFileName && (
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); alert(`محاكاة تحميل الملف الرقمي المؤرشف: \n${letItem.attachedFileName} \nالملف محفوظ بنجاح بالسحابة في الأرشيف المركزي.`); }}
                      className="text-indigo-600 hover:underline font-bold flex items-center gap-1 uppercase"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>{letItem.attachedFileName}</span>
                    </a>
                  )}
                </div>

              </div>

            </div>
          );
        })}

        {filteredLetters.length === 0 && (
          <div className="md:col-span-2 text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-xs">
            <AlertTriangle className="w-14 h-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">لا يوجد كتب موافقة لشريط الفلترة الحالي</h3>
            <p className="text-slate-500 text-xs mt-1">يرجى تسجيل كتب رسمية جديدة أو تغيير معيار تصفية الصلاحيات.</p>
          </div>
        )}
      </div>

    </div>
  );
}
