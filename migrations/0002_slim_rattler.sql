CREATE TABLE "quiz_response" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"question_id" text NOT NULL,
	"participant_id" text NOT NULL,
	"selected_answer_ids" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quiz_response" ADD CONSTRAINT "quiz_response_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_response" ADD CONSTRAINT "quiz_response_question_id_quiz_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."quiz_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_response" ADD CONSTRAINT "quiz_response_participant_id_quiz_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."quiz_participant"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_response_question_participant_idx" ON "quiz_response" USING btree ("question_id","participant_id");