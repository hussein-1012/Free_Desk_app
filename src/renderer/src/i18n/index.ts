// نظام الترجمة — عربي فقط، لا يوجد اختيار للغة
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const ar = {
  translation: {
    // ============================================================
    // التنقل والرئيسية
    // ============================================================
    app_name: 'نظام إدارة المحل',
    home: 'الرئيسية',
    back: 'رجوع',

    // أقسام الشاشة الرئيسية
    section_oils_retail:    'الزيوت (تجزئة)',
    section_oils_wholesale: 'الزيوت (جملة)',
    section_wash:           'غسيل السيارات والدراجات',
    section_accessories:    'الإكسسوارات',
    section_customers:      'العملاء',
    section_suppliers:      'الموردون',
    section_purchases:      'المشتريات',
    section_sales:          'المبيعات / الفواتير',
    section_inventory:      'المخزون',
    section_reports:        'التقارير',
    section_settings:       'الإعدادات',

    // ============================================================
    // لوحة التحكم
    // ============================================================
    dashboard:         'لوحة التحكم',
    today_sales:       'مبيعات اليوم',
    today_purchases:   'مشتريات اليوم',
    cash_balance:      'رصيد الصندوق',
    customer_count:    'عدد العملاء',
    supplier_count:    'عدد الموردين',
    low_stock_alert:   'تنبيهات نقص المخزون',
    active_wash_orders:'طلبات الغسيل الجارية',
    near_expiry:       'زيوت قاربت على الانتهاء',
    recent_invoices:   'أحدث الفواتير',
    sales_vs_purchases:'المبيعات مقابل المشتريات',
    last_7_days:       'آخر 7 أيام',
    data_updated:      'البيانات محدّثة',

    // ============================================================
    // الحقول المشتركة
    // ============================================================
    name:         'الاسم',
    phone:        'رقم الهاتف',
    email:        'البريد الإلكتروني',
    address:      'العنوان',
    notes:        'ملاحظات',
    balance:      'الرصيد',
    status:       'الحالة',
    date:         'التاريخ',
    actions:      'الإجراءات',
    total:        'الإجمالي',
    paid:         'المدفوع',
    remaining:    'المتبقي',
    subtotal:     'المجموع قبل الخصم',
    discount:     'الخصم',
    tax:          'الضريبة',
    quantity:     'الكمية',
    price:        'السعر',
    unit_price:   'سعر الوحدة',
    description:  'الوصف',
    category:     'التصنيف',
    barcode:      'الباركود',
    image:        'الصورة',
    search:       'بحث...',
    invoice_no:   'رقم الفاتورة',
    order_no:     'رقم الطلب',
    created_by:   'بواسطة',
    created_at:   'تاريخ الإنشاء',
    updated_at:   'آخر تحديث',

    // ============================================================
    // الأزرار
    // ============================================================
    save:         'حفظ',
    cancel:       'إلغاء',
    edit:         'تعديل',
    delete:       'حذف',
    add:          'إضافة',
    create:       'إنشاء',
    print:        'طباعة',
    export_pdf:   'تصدير PDF',
    export_excel: 'تصدير Excel',
    import_excel: 'استيراد Excel',
    backup:       'نسخ احتياطي',
    restore:      'استعادة',
    close:        'إغلاق',
    confirm:      'تأكيد',
    view:         'عرض',
    return:       'إرجاع',
    pay:          'دفع',

    // ============================================================
    // حالات الفاتورة
    // ============================================================
    status_draft:     'مسودة',
    status_confirmed: 'مؤكدة',
    status_paid:      'مدفوعة',
    status_partial:   'دفع جزئي',
    status_cancelled: 'ملغاة',

    // ============================================================
    // العملاء
    // ============================================================
    customers:          'العملاء',
    customer:           'العميل',
    add_customer:       'إضافة عميل',
    edit_customer:      'تعديل بيانات العميل',
    delete_customer:    'حذف العميل',
    customer_statement: 'كشف حساب العميل',
    car_number:         'رقم لوحة السيارة',
    odometer_reading:   'قراءة العداد (كم)',
    odometer_history:   'سجل قراءات العداد',
    add_odometer:       'تسجيل قراءة عداد',
    walk_in_customer:   'عميل مجهول',
    no_customers:       'لا يوجد عملاء',

    // ============================================================
    // الموردون
    // ============================================================
    suppliers:        'الموردون',
    supplier:         'المورد',
    company_name:     'اسم الشركة',
    add_supplier:     'إضافة مورد',
    edit_supplier:    'تعديل بيانات المورد',
    supplier_statement: 'كشف حساب المورد',
    purchase_history: 'سجل المشتريات',
    no_suppliers:     'لا يوجد موردون',

    // ============================================================
    // المنتجات
    // ============================================================
    products:       'المنتجات',
    product:        'المنتج',
    add_product:    'إضافة منتج',
    purchase_price: 'سعر الشراء',
    selling_price:  'سعر البيع',
    min_quantity:   'الحد الأدنى للكمية',
    location:       'موقع في المستودع',
    low_stock:      'مخزون منخفض',
    out_of_stock:   'نفد المخزون',
    in_stock:       'متوفر',
    no_products:    'لا يوجد منتجات',

    // ============================================================
    // الإكسسوارات
    // ============================================================
    accessories:     'الإكسسوارات',
    accessory:       'إكسسوار',
    add_accessory:   'إضافة إكسسوار',
    edit_accessory:  'تعديل الإكسسوار',
    no_accessories:  'لا يوجد إكسسوارات',

    // ============================================================
    // الزيوت
    // ============================================================
    oils:              'الزيوت',
    oil:               'زيت',
    oil_type:          'نوع الزيت',
    brand:             'العلامة التجارية',
    size:              'الحجم',
    batch_no:          'رقم الدفعة',
    expiry_date:       'تاريخ الانتهاء',
    carton:            'كرتون',
    can:               'علبة',
    liter:             'تر',
    cans_per_carton:   'عدد العلب في الكرتون',
    can_capacity:      'سعة العلبة (تر)',
    price_per_carton:  'سعر الكرتون',
    price_per_can:     'سعر العلبة',
    price_per_liter:   'سعر التر',
    wholesale_price:   'سعر الجملة',
    retail_price:      'سعر التجزئة',
    open_containers:   'علب مفتوحة',
    remaining_liters:  'التر المتبقية',
    near_expiry_title: 'زيوت قاربت على الانتهاء',
    oil_type_motor:    'زيت محرك',
    oil_type_gear:     'زيت ناقل حركة',
    oil_type_hydraulic:'زيت هيدروليك',
    oil_type_brake:    'سائل فرامل',
    oil_type_coolant:  'سائل تبريد',
    oil_type_other:    'أخرى',
    add_oil_product:   'إضافة منتج زيت',
    edit_oil_product:  'تعديل منتج زيت',
    no_oil_products:   'لا يوجد منتجات زيوت',

    // ============================================================
    // غسيل السيارات والدراجات
    // ============================================================
    wash:               'الغسيل',
    wash_orders:        'طلبات الغسيل',
    wash_order:         'طلب غسيل',
    new_wash_order:     'طلب غسيل جديد',
    edit_wash_order:    'تعديل طلب الغسيل',
    received_date:      'تاريخ الاستلام',
    delivery_date:      'تاريخ التسليم',
    service_type:       'نوع الخدمة',
    vehicle_type:       'نوع المركبة',
    vehicle_plate:      'رقم اللوحة',
    car:                'سيارة',
    bike:               'دراجة',
    service_bag_polish:        'شنطة ومطور',
    service_interior_exterior: 'داخلي وخارجي',
    service_chemical_wash:     'غسيل كيميائي',
    service_exterior_only:     'خارجي فقط',
    service_vip:               'VIP',
    service_bike_wash:         'غسيل دراجة',
    status_received:  'مستلم',
    status_washing:   'جارٍ الغسيل',
    status_ready:     'جاهز للتسليم',
    status_delivered: 'تم التسليم',
    status_wash_cancelled: 'ملغى',
    no_wash_orders:   'لا يوجد طلبات غسيل',
    wash_pipeline:    'خط سير الطلبات',

    // ============================================================
    // المشتريات
    // ============================================================
    purchases:          'المشتريات',
    purchase_invoice:   'فاتورة شراء',
    new_purchase:       'فاتورة شراء جديدة',
    purchase_items:     'بنود الفاتورة',
    add_item:           'إضافة بند',
    no_purchases:       'لا يوجد فواتير شراء',

    // ============================================================
    // المبيعات
    // ============================================================
    sales:            'المبيعات',
    sale_invoice:     'فاتورة بيع',
    new_sale:         'فاتورة بيع جديدة',
    sale_return:      'مرتجع بيع',
    no_sales:         'لا يوجد فواتير بيع',

    // ============================================================
    // المخزون
    // ============================================================
    inventory:          'المخزون',
    stock_count:        'جرد المخزون',
    stock_adjustment:   'تسوية مخزون',
    stock_movements:    'حركة المخزون',
    adjustment_add:     'إضافة',
    adjustment_remove:  'خصم',
    adjustment_damaged: 'تالف',
    adjustment_missing: 'مفقود',
    system_quantity:    'الكمية في النظام',
    actual_quantity:    'الكمية الفعلية',
    difference:         'الفرق',
    no_movements:       'لا يوجد حركات مخزون',

    // ============================================================
    // التقارير
    // ============================================================
    reports:       'التقارير',
    period_today:  'اليوم',
    period_week:   'هذا الأسبوع',
    period_month:  'هذا الشهر',
    period_year:   'هذا العام',
    period_custom: 'فترة مخصصة',
    from_date:     'من تاريخ',
    to_date:       'إلى تاريخ',
    total_revenue: 'إجمالي الإيرادات',
    total_expenses:'إجمالي المصروفات',
    net_profit:    'صافي الربح',
    sales_report:   'تقرير المبيعات',
    purchase_report:'تقرير المشتريات',
    oil_report:     'تقرير الزيوت',
    wash_report:    'تقرير الغسيل',
    cash_report:    'تقرير الصندوق',

    // ============================================================
    // الإعدادات
    // ============================================================
    settings:          'الإعدادات',
    business_info:     'معلومات المؤسسة',
    business_name:     'اسم المؤسسة',
    business_address:  'عنوان المؤسسة',
    business_phone:    'هاتف المؤسسة',
    business_logo:     'شعار المؤسسة',
    tax_pct:           'نسبة الضريبة %',
    currency:          'رمز العملة',
    dark_mode:         'المظهر الداكن',
    printer_settings:  'إعدادات الطابعة',
    receipt_width:     'عرض الإيصال (ملم)',
    printer_name:      'اسم الطابعة',
    session_timeout:   'مهلة قفل الشاشة (دقيقة)',
    user_management:   'إدارة المستخدمين',
    icon_customization:'تخصيص الأيقونات',
    backup_settings:   'النسخ الاحتياطي',
    audit_log:         'سجل العمليات',
    save_settings:     'حفظ الإعدادات',

    // ============================================================
    // المصادقة
    // ============================================================
    login_title:     'تسجيل الدخول',
    login_subtitle:  'نظام إدارة محلي مؤمّن وغير متصل بالإنترنت',
    username:        'اسم المستخدم',
    password:        'كلمة المرور',
    login_btn:       'دخول',
    logging_in:      'جارٍ الدخول...',
    default_creds:   'بيانات الدخول الافتراضية:',
    logout:          'تسجيل الخروج',
    session_locked:  'الجلسة مقفلة',
    unlock_session:  'فتح الجلسة',
    enter_password:  'أدخل كلمة المرور للمتابعة',

    // ============================================================
    // رسائل التأكيد والأخطاء
    // ============================================================
    confirm_delete:       'هل أنت متأكد من الحذف؟',
    confirm_delete_msg:   'لا يمكن التراجع عن هذا الإجراء.',
    delete_success:       'تم الحذف بنجاح',
    save_success:         'تم الحفظ بنجاح',
    create_success:       'تم الإنشاء بنجاح',
    update_success:       'تم التحديث بنجاح',
    error_occurred:       'حدث خطأ',
    loading:              'جارٍ التحميل...',
    no_data:              'لا يوجد بيانات',
    required_field:       'هذا الحقل مطلوب',
    invalid_amount:       'المبلغ غير صالح',
    insufficient_stock:   'الكمية المتوفرة غير كافية',

    // ============================================================
    // الطباعة
    // ============================================================
    receipt:        'إيصال',
    invoice:        'فاتورة',
    statement:      'كشف حساب',
    print_receipt:  'طباعة إيصال',
    print_invoice:  'طباعة فاتورة',
    tax_included:   'شامل الضريبة',
    thank_you:      'شكراً لزيارتكم',
  },
};

i18n.use(initReactI18next).init({
  resources: { ar },
  lng: 'ar',
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
});

export default i18n;
