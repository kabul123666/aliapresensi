CREATE TYPE "public"."approval_mode" AS ENUM('ANY', 'ALL');--> statement-breakpoint
CREATE TYPE "public"."approval_scope" AS ENUM('ALL', 'DEPARTMENT', 'LOCATION');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('ON_TIME', 'LATE', 'EARLY_LEAVE', 'OVERTIME', 'ABSENT', 'ON_LEAVE', 'HOLIDAY', 'DAY_OFF', 'INCOMPLETE');--> statement-breakpoint
CREATE TYPE "public"."decision" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."encashment_status" AS ENUM('DRAFT', 'APPROVED', 'PAID');--> statement-breakpoint
CREATE TYPE "public"."outside_policy" AS ENUM('BLOCK', 'REQUIRE_REASON', 'FLAG_ONLY');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('OVERTIME', 'BACKDATE', 'LEAVE', 'PERMIT', 'OUTSIDE_AREA', 'DEVICE_CHANGE');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'KARYAWAN');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('PENDING_APPROVAL', 'INVITED', 'ACTIVE', 'SUSPENDED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."worklog_status" AS ENUM('SUBMITTED', 'VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."year_end_choice" AS ENUM('ENCASH', 'CARRY_OVER', 'SPLIT');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"judul" varchar(200) NOT NULL,
	"isi" text NOT NULL,
	"target_role" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dibuat_oleh" uuid,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval_rule_actors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_id" uuid NOT NULL,
	"step" integer DEFAULT 1 NOT NULL,
	"approver_user_id" uuid,
	"approver_role" "role",
	"delegate_user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "approval_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipe_pengajuan" "request_type" NOT NULL,
	"scope" "approval_scope" DEFAULT 'ALL' NOT NULL,
	"scope_id" uuid,
	"total_step" integer DEFAULT 1 NOT NULL,
	"mode" "approval_mode" DEFAULT 'ANY' NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"tanggal" date NOT NULL,
	"shift_id" uuid,
	"status" "attendance_status" DEFAULT 'INCOMPLETE' NOT NULL,
	"clock_in_at" timestamp with time zone,
	"clock_in_photo" text,
	"clock_in_lat" real,
	"clock_in_lng" real,
	"clock_in_accuracy" real,
	"clock_in_address" text,
	"clock_in_distance_m" integer,
	"clock_in_outside_area" boolean DEFAULT false NOT NULL,
	"clock_in_reason" text,
	"clock_out_at" timestamp with time zone,
	"clock_out_photo" text,
	"clock_out_lat" real,
	"clock_out_lng" real,
	"clock_out_accuracy" real,
	"clock_out_address" text,
	"clock_out_distance_m" integer,
	"clock_out_outside_area" boolean DEFAULT false NOT NULL,
	"clock_out_reason" text,
	"menit_terlambat" integer DEFAULT 0 NOT NULL,
	"menit_lembur" integer DEFAULT 0 NOT NULL,
	"durasi_kerja_menit" integer DEFAULT 0 NOT NULL,
	"catatan_kerja" text,
	"device_fingerprint" varchar(128),
	"flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"hasil_koreksi" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "attendances_employee_tanggal_unique" UNIQUE("employee_id","tanggal")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"aksi" varchar(80) NOT NULL,
	"entitas" varchar(80) NOT NULL,
	"entitas_id" varchar(80),
	"before" jsonb,
	"after" jsonb,
	"ip" varchar(64),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(120) NOT NULL,
	"keterangan" text,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "departments_nama_unique" UNIQUE("nama")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nama" varchar(160) NOT NULL,
	"no_hp" varchar(32),
	"department_id" uuid,
	"position_id" uuid,
	"location_id" uuid,
	"shift_id" uuid,
	"tipe_karyawan" varchar(40) DEFAULT 'TETAP' NOT NULL,
	"tanggal_masuk" date,
	"foto_profil" text,
	"gaji_pokok" integer,
	"device_fingerprint" varchar(128),
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employees_user_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "holidays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tanggal" date NOT NULL,
	"nama" varchar(160) NOT NULL,
	"nasional" boolean DEFAULT true NOT NULL,
	CONSTRAINT "holidays_tanggal_unique" UNIQUE("tanggal")
);
--> statement-breakpoint
CREATE TABLE "leave_balances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"tahun" integer NOT NULL,
	"kuota" integer DEFAULT 0 NOT NULL,
	"carry_over_masuk" integer DEFAULT 0 NOT NULL,
	"terpakai" integer DEFAULT 0 NOT NULL,
	"pending" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "leave_balances_unique" UNIQUE("employee_id","leave_type_id","tahun")
);
--> statement-breakpoint
CREATE TABLE "leave_encashments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"leave_type_id" uuid NOT NULL,
	"tahun" integer NOT NULL,
	"jumlah_hari" integer NOT NULL,
	"tarif_per_hari" integer NOT NULL,
	"total_nominal" integer NOT NULL,
	"status" "encashment_status" DEFAULT 'DRAFT' NOT NULL,
	"diproses_oleh" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leave_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(120) NOT NULL,
	"kuota_default" integer DEFAULT 0 NOT NULL,
	"berbayar" boolean DEFAULT true NOT NULL,
	"butuh_lampiran" boolean DEFAULT false NOT NULL,
	"boleh_carry_over" boolean DEFAULT false NOT NULL,
	"boleh_diuangkan" boolean DEFAULT false NOT NULL,
	"max_carry_over_hari" integer DEFAULT 0 NOT NULL,
	"tgl_kedaluwarsa_carry" varchar(5),
	"warna" varchar(16) DEFAULT '#6366f1' NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(160) NOT NULL,
	"alamat" text,
	"lat" real NOT NULL,
	"lng" real NOT NULL,
	"radius_m" integer DEFAULT 150 NOT NULL,
	"outside_policy" "outside_policy" DEFAULT 'REQUIRE_REASON' NOT NULL,
	"gps_accuracy_tolerance_m" integer DEFAULT 50 NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tipe" varchar(40) NOT NULL,
	"judul" varchar(200) NOT NULL,
	"isi" text,
	"link" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(120) NOT NULL,
	"department_id" uuid,
	"isi_form_tindakan" boolean DEFAULT false NOT NULL,
	"kuota_cuti_override" integer,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "procedure_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(160) NOT NULL,
	"kategori" varchar(40) DEFAULT 'RINGAN' NOT NULL,
	"fee_default" integer DEFAULT 0 NOT NULL,
	"keterangan" text,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "procedure_fee_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"procedure_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"fee" integer NOT NULL,
	CONSTRAINT "procedure_fee_rates_unique" UNIQUE("procedure_id","position_id")
);
--> statement-breakpoint
CREATE TABLE "request_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"step" integer DEFAULT 1 NOT NULL,
	"approver_id" uuid,
	"keputusan" "decision" DEFAULT 'PENDING' NOT NULL,
	"catatan" text,
	"acted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"tipe" "request_type" NOT NULL,
	"status" "request_status" DEFAULT 'PENDING' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"alasan" text,
	"lampiran" text,
	"current_step" integer DEFAULT 1 NOT NULL,
	"total_step" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"selesai_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" varchar(128) NOT NULL,
	"user_agent" text,
	"ip" varchar(64),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" varchar(80) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"keterangan" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shift_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"tanggal" date NOT NULL,
	"shift_id" uuid,
	"libur" boolean DEFAULT false NOT NULL,
	CONSTRAINT "shift_schedules_unique" UNIQUE("employee_id","tanggal")
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(80) NOT NULL,
	"jam_masuk" time NOT NULL,
	"jam_pulang" time NOT NULL,
	"lintas_hari" boolean DEFAULT false NOT NULL,
	"toleransi_menit" integer DEFAULT 10 NOT NULL,
	"ambang_lembur_menit" integer DEFAULT 30 NOT NULL,
	"hari_kerja" jsonb DEFAULT '[1,2,3,4,5]'::jsonb NOT NULL,
	"istirahat_menit" integer DEFAULT 60 NOT NULL,
	"batas_clockin_dini_menit" integer DEFAULT 60 NOT NULL,
	"warna" varchar(16) DEFAULT '#14a07c' NOT NULL,
	"aktif" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(40) NOT NULL,
	"email" varchar(190),
	"nik" varchar(40),
	"password_hash" text,
	"role" "role" DEFAULT 'KARYAWAN' NOT NULL,
	"status" "user_status" DEFAULT 'PENDING_APPROVAL' NOT NULL,
	"gagal_login" integer DEFAULT 0 NOT NULL,
	"terkunci_sampai" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
CREATE TABLE "work_log_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attendance_id" uuid NOT NULL,
	"procedure_id" uuid,
	"nama_tindakan" varchar(160) NOT NULL,
	"jumlah" integer DEFAULT 1 NOT NULL,
	"kode_pasien" varchar(40),
	"fee_snapshot" integer DEFAULT 0 NOT NULL,
	"catatan" text,
	"status" "worklog_status" DEFAULT 'SUBMITTED' NOT NULL,
	"verified_by" uuid,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "year_end_closings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tahun" integer NOT NULL,
	"dijalankan_oleh" uuid,
	"dijalankan_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ringkasan" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "year_end_closings_tahun_unique" UNIQUE("tahun")
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_dibuat_oleh_users_id_fk" FOREIGN KEY ("dibuat_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_rule_actors" ADD CONSTRAINT "approval_rule_actors_rule_id_approval_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."approval_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_rule_actors" ADD CONSTRAINT "approval_rule_actors_approver_user_id_users_id_fk" FOREIGN KEY ("approver_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_rule_actors" ADD CONSTRAINT "approval_rule_actors_delegate_user_id_users_id_fk" FOREIGN KEY ("delegate_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_leave_type_id_leave_types_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_encashments" ADD CONSTRAINT "leave_encashments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_encashments" ADD CONSTRAINT "leave_encashments_leave_type_id_leave_types_id_fk" FOREIGN KEY ("leave_type_id") REFERENCES "public"."leave_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_encashments" ADD CONSTRAINT "leave_encashments_diproses_oleh_users_id_fk" FOREIGN KEY ("diproses_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedure_fee_rates" ADD CONSTRAINT "procedure_fee_rates_procedure_id_procedure_catalog_id_fk" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedure_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "procedure_fee_rates" ADD CONSTRAINT "procedure_fee_rates_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_approvals" ADD CONSTRAINT "request_approvals_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_approvals" ADD CONSTRAINT "request_approvals_approver_id_users_id_fk" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_schedules" ADD CONSTRAINT "shift_schedules_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_schedules" ADD CONSTRAINT "shift_schedules_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_log_items" ADD CONSTRAINT "work_log_items_attendance_id_attendances_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_log_items" ADD CONSTRAINT "work_log_items_procedure_id_procedure_catalog_id_fk" FOREIGN KEY ("procedure_id") REFERENCES "public"."procedure_catalog"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_log_items" ADD CONSTRAINT "work_log_items_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "year_end_closings" ADD CONSTRAINT "year_end_closings_dijalankan_oleh_users_id_fk" FOREIGN KEY ("dijalankan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "attendances_tanggal_idx" ON "attendances" USING btree ("tanggal");--> statement-breakpoint
CREATE INDEX "attendances_status_idx" ON "attendances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "audit_logs_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "employees_department_idx" ON "employees" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id","read_at");--> statement-breakpoint
CREATE INDEX "request_approvals_request_idx" ON "request_approvals" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "requests_status_idx" ON "requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "requests_employee_idx" ON "requests" USING btree ("employee_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "work_log_items_attendance_idx" ON "work_log_items" USING btree ("attendance_id");