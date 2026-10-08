// ============================================================
// COURTLY — Scripted Courtroom Demo Engine & Dialogue Sequences
// ============================================================

export interface ScriptStageDialogue {
  stageIndex: number;
  stageName: string;
  stageDescription: string;
  lines: {
    speakerId: 'part-judge' | 'part-opp-counsel' | 'part-witness' | 'part-student';
    speakerName: string;
    speakerRole: string;
    text: string;
    pauseMs: number;
    recommendedAction?: string;
    isKeyMoment?: boolean;
    audioVoiceRole: 'judge' | 'opposing_counsel' | 'witness' | 'student';
  }[];
}

export const COURTROOM_SCRIPT: ScriptStageDialogue[] = [
  {
    stageIndex: 0,
    stageName: 'Preliminary Submissions',
    stageDescription: 'Formal appearance, preliminary procedural housekeeping, and identification of key issues in dispute.',
    lines: [
      {
        speakerId: 'part-judge',
        speakerName: 'The Hon. Justice Robert Vance',
        speakerRole: 'Presiding Judge',
        text: 'The High Court of Justice, Commercial Court is now in session. In the matter of Henderson v Caldwell Trading Ltd (Claim No. CL-2025-000842). Are counsel for the parties ready to proceed?',
        pauseMs: 4000,
        isKeyMoment: true,
        audioVoiceRole: 'judge',
      },
      {
        speakerId: 'part-student',
        speakerName: 'Alex Morgan',
        speakerRole: 'Claimant Counsel (You)',
        text: 'May it please the Court, Alex Morgan appearing on behalf of the Claimant, Mr. David Henderson trading as Henderson Precision Engineering. We are ready to proceed, My Lord.',
        pauseMs: 4500,
        audioVoiceRole: 'student',
      },
      {
        speakerId: 'part-opp-counsel',
        speakerName: 'Eleanor Davies KC',
        speakerRole: 'Defendant Counsel',
        text: 'And may it please your Lordship, Eleanor Davies appearing with junior counsel for the Defendant, Caldwell Trading Ltd. The Defendant is also ready.',
        pauseMs: 4000,
        audioVoiceRole: 'opposing_counsel',
      },
      {
        speakerId: 'part-judge',
        speakerName: 'The Hon. Justice Robert Vance',
        speakerRole: 'Presiding Judge',
        text: 'Very well. I have reviewed the pleadings and core bundle. The central dispute turns on whether Caldwell’s early termination was justified under Clause 8.1 of the Distribution Agreement. Claimant counsel, you may deliver your opening statement.',
        pauseMs: 5000,
        recommendedAction: 'Prepare to deliver opening submissions on breach of contract.',
        isKeyMoment: true,
        audioVoiceRole: 'judge',
      },
    ],
  },
  {
    stageIndex: 1,
    stageName: 'Claimant Opening Submissions',
    stageDescription: 'Setting out the legal theory, contractual obligations, and establishing the wrongful repudiation.',
    lines: [
      {
        speakerId: 'part-student',
        speakerName: 'Alex Morgan',
        speakerRole: 'Claimant Counsel (You)',
        text: 'My Lord, this is a clear case of wrongful repudiatory breach. On 15 January 2024, the parties entered into an exclusive 3-year distribution agreement. Henderson fulfilled all production benchmarks.',
        pauseMs: 5000,
        audioVoiceRole: 'student',
      },
      {
        speakerId: 'part-student',
        speakerName: 'Alex Morgan',
        speakerRole: 'Claimant Counsel (You)',
        text: 'On 20 April 2025, Caldwell unilaterally purported to terminate the contract without affording Henderson the mandatory 14-day cure period stipulated in Clause 8.1. We seek damages of £145,000 for lost profits.',
        pauseMs: 5500,
        isKeyMoment: true,
        audioVoiceRole: 'student',
      },
      {
        speakerId: 'part-judge',
        speakerName: 'The Hon. Justice Robert Vance',
        speakerRole: 'Presiding Judge',
        text: 'Counsel, what do you say to the defense allegation that the initial delivery on 12 March 2025 was fundamentally defective, thereby entitling them to treat the contract as repudiated under Section 14(2) of the Sale of Goods Act 1979?',
        pauseMs: 6000,
        recommendedAction: 'Refer to Exhibit A (Clause 4.2) and the technical inspection report.',
        isKeyMoment: true,
        audioVoiceRole: 'judge',
      },
      {
        speakerId: 'part-student',
        speakerName: 'Alex Morgan',
        speakerRole: 'Claimant Counsel (You)',
        text: 'My Lord, the minor calibration variance reported on 12 March was promptly rectified within 48 hours. Under Clause 4.2, the contract expressly contemplated minor adjustments without vitiating the core bargain.',
        pauseMs: 5500,
        audioVoiceRole: 'student',
      },
    ],
  },
  {
    stageIndex: 2,
    stageName: 'Examination-in-Chief & Evidence',
    stageDescription: 'Examining Claimant witness Mr. David Henderson and tendering Exhibit A into evidence.',
    lines: [
      {
        speakerId: 'part-student',
        speakerName: 'Alex Morgan',
        speakerRole: 'Claimant Counsel (You)',
        text: 'Mr. Henderson, turning to the delivery of 12 March 2025, could you explain the steps you took upon receiving Caldwell’s notice regarding the shipment tolerance?',
        pauseMs: 5000,
        audioVoiceRole: 'student',
      },
      {
        speakerId: 'part-witness',
        speakerName: 'David Henderson',
        speakerRole: 'Claimant (Witness)',
        text: 'I immediately dispatched our senior technician to their warehouse on 13 March. We recalibrated the entire batch at our own expense within 48 hours, and Caldwell signed the inspection release form.',
        pauseMs: 6000,
        isKeyMoment: true,
        audioVoiceRole: 'witness',
      },
      {
        speakerId: 'part-student',
        speakerName: 'Alex Morgan',
        speakerRole: 'Claimant Counsel (You)',
        text: 'My Lord, if I may formally direct the Court to Exhibit B, the signed warehouse inspection acceptance note dated 14 March 2025.',
        pauseMs: 4500,
        recommendedAction: 'Click Tender Evidence to mark Exhibit B as admitted.',
        audioVoiceRole: 'student',
      },
      {
        speakerId: 'part-judge',
        speakerName: 'The Hon. Justice Robert Vance',
        speakerRole: 'Presiding Judge',
        text: 'Exhibit B is admitted. Ms. Davies, any objection to the documentary record?',
        pauseMs: 3500,
        audioVoiceRole: 'judge',
      },
      {
        speakerId: 'part-opp-counsel',
        speakerName: 'Eleanor Davies KC',
        speakerRole: 'Defendant Counsel',
        text: 'No objection to the document’s authenticity, My Lord, though we contest the witness’s characterization of its legal effect.',
        pauseMs: 4000,
        audioVoiceRole: 'opposing_counsel',
      },
    ],
  },
  {
    stageIndex: 3,
    stageName: 'Defense Cross-Examination & Objections',
    stageDescription: 'Opposing counsel cross-examines the witness; opportunities to raise evidentiary objections.',
    lines: [
      {
        speakerId: 'part-opp-counsel',
        speakerName: 'Eleanor Davies KC',
        speakerRole: 'Defendant Counsel',
        text: 'Mr. Henderson, isn’t it true that your manufacturing plant was suffering from chronic supply chain bottlenecks throughout early 2025, and you knew you couldn’t meet the second quarter quota?',
        pauseMs: 5500,
        recommendedAction: 'Raise Objection: Speculation / Argumentative.',
        isKeyMoment: true,
        audioVoiceRole: 'opposing_counsel',
      },
      {
        speakerId: 'part-witness',
        speakerName: 'David Henderson',
        speakerRole: 'Claimant (Witness)',
        text: 'No, that is completely untrue. We had secured backup raw alloy inventory from Sheffield.',
        pauseMs: 4000,
        audioVoiceRole: 'witness',
      },
      {
        speakerId: 'part-opp-counsel',
        speakerName: 'Eleanor Davies KC',
        speakerRole: 'Defendant Counsel',
        text: 'Well, somebody in your warehouse told my client’s logistics director that you were running on empty, didn’t they?',
        pauseMs: 5000,
        recommendedAction: 'Raise Objection: Hearsay / CPR Evidence Rules.',
        isKeyMoment: true,
        audioVoiceRole: 'opposing_counsel',
      },
      {
        speakerId: 'part-judge',
        speakerName: 'The Hon. Justice Robert Vance',
        speakerRole: 'Presiding Judge',
        text: 'Ms. Davies, that is classic hearsay unless you intend to call this unnamed warehouse staff member. Let us move to matters within this witness’s direct knowledge.',
        pauseMs: 5000,
        audioVoiceRole: 'judge',
      },
    ],
  },
  {
    stageIndex: 4,
    stageName: 'Closing Submissions & Mitigation',
    stageDescription: 'Synthesizing evidence, addressing mitigation of loss under Hadley v Baxendale, and concluding advocacy.',
    lines: [
      {
        speakerId: 'part-student',
        speakerName: 'Alex Morgan',
        speakerRole: 'Claimant Counsel (You)',
        text: 'My Lord, in closing, the evidence demonstrates that Henderson was ready, willing, and able to perform. The termination by Caldwell was premature, unlawful, and executed in bad faith to switch to a cheaper offshore supplier.',
        pauseMs: 6000,
        isKeyMoment: true,
        audioVoiceRole: 'student',
      },
      {
        speakerId: 'part-student',
        speakerName: 'Alex Morgan',
        speakerRole: 'Claimant Counsel (You)',
        text: 'As established in Hadley v Baxendale, the loss of £145,000 flowed directly and naturally from this repudiation. Henderson took all reasonable steps to mitigate by seeking alternative buyers in a depressed specialist market.',
        pauseMs: 6000,
        audioVoiceRole: 'student',
      },
      {
        speakerId: 'part-opp-counsel',
        speakerName: 'Eleanor Davies KC',
        speakerRole: 'Defendant Counsel',
        text: 'My Lord, the commercial reality was that the goods failed quality thresholds on delivery. Caldwell was fully entitled to terminate to preserve its downstream reputation.',
        pauseMs: 5000,
        audioVoiceRole: 'opposing_counsel',
      },
    ],
  },
  {
    stageIndex: 5,
    stageName: 'Judicial Determination',
    stageDescription: 'The Hon. Justice Vance delivers oral reasons and enters judgment.',
    lines: [
      {
        speakerId: 'part-judge',
        speakerName: 'The Hon. Justice Robert Vance',
        speakerRole: 'Presiding Judge',
        text: 'I thank both counsel for their succinct oral submissions. Having considered the evidence, the Court finds that Clause 8.1 established a mandatory condition precedent requiring 14 days written notice of cure.',
        pauseMs: 6000,
        isKeyMoment: true,
        audioVoiceRole: 'judge',
      },
      {
        speakerId: 'part-judge',
        speakerName: 'The Hon. Justice Robert Vance',
        speakerRole: 'Presiding Judge',
        text: 'The Defendant failed to provide such notice, and the minor variance was remedied within 48 hours. Accordingly, judgment is entered for the Claimant with damages assessed at £145,000 plus statutory interest.',
        pauseMs: 6000,
        isKeyMoment: true,
        audioVoiceRole: 'judge',
      },
      {
        speakerId: 'part-judge',
        speakerName: 'The Hon. Justice Robert Vance',
        speakerRole: 'Presiding Judge',
        text: 'Counsel for the Claimant presented a structured, rigorous argument with commendable mastery of contract doctrine and evidence. The Court stands adjourned.',
        pauseMs: 5000,
        recommendedAction: 'Proceed to Performance & Judicial Scorecard.',
        isKeyMoment: true,
        audioVoiceRole: 'judge',
      },
    ],
  },
];
