import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StackedFraction } from '../../components/ui/StackedFraction';
import { OptionButton } from '../../components/ui/OptionButton';
import { Mascot } from '../../components/ui/Mascot';
import { Chip } from '../../components/ui/Chip';
import { ProgressBar, StrengthMeter } from '../../components/ui/ProgressBar';
import { KpiTile } from '../../components/ui/KpiTile';
import { HeatmapCell } from '../../components/ui/HeatmapCell';
import { SubjectCard } from '../../components/ui/SubjectCard';

export const DesignSystemPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#734DFD]">
          Design System & Design Tokens
        </span>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 mt-1">
          WhyWrong Token & Component Showcase
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Sampled directly from mockup figures 1–5: midnight dark, student light, teacher dark, and 9 subject pastels.
        </p>
      </div>

      {/* Colors & Tokens */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display text-slate-900">1. Color Palette Tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#0B1020] text-white">
            <p className="font-bold">Midnight</p>
            <p className="font-mono text-[10px] text-slate-400">#0B1020</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0C1421] text-white">
            <p className="font-bold">Teacher Dark</p>
            <p className="font-mono text-[10px] text-slate-400">#0C1421</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#734DFD] text-white">
            <p className="font-bold">Primary</p>
            <p className="font-mono text-[10px] text-slate-200">#734DFD</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#22D3EE] text-slate-900">
            <p className="font-bold">Cyan Accent</p>
            <p className="font-mono text-[10px]">#22D3EE</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#0BAA7B] text-white">
            <p className="font-bold">Success</p>
            <p className="font-mono text-[10px] text-slate-200">#0BAA7B</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#E5484D] text-white">
            <p className="font-bold">Danger</p>
            <p className="font-mono text-[10px] text-slate-200">#E5484D</p>
          </div>
        </div>
      </section>

      {/* 9 Subject Pastels */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display text-slate-900">2. 9 Subject Pastel Palette</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 text-center text-xs">
          {[
            { name: 'Math', hex: '#D9C2FC' },
            { name: 'Physics', hex: '#D4FBE9' },
            { name: 'Computing', hex: '#FDDFE6' },
            { name: 'Chemistry', hex: '#E3F7E0' },
            { name: 'Biology', hex: '#FEEACC' },
            { name: 'English', hex: '#E2F1FE' },
            { name: 'Geography', hex: '#FEF5D7' },
            { name: 'Economics', hex: '#ECE0FC' },
            { name: 'Health', hex: '#FFEBE5' },
          ].map((c) => (
            <div key={c.name} style={{ backgroundColor: c.hex }} className="p-3 rounded-2xl text-slate-900 font-bold border border-black/5">
              <p>{c.name}</p>
              <p className="text-[10px] font-mono opacity-70">{c.hex}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display text-slate-900">3. Button Variants</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="gradient">Gradient CTA</Button>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </section>

      {/* Stacked Fraction KaTeX */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display text-slate-900">4. Stacked Fractions (KaTeX)</h2>
        <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-wrap items-center gap-6 text-xl">
          <StackedFraction math="\frac{1}{3} + \frac{1}{4} = \frac{7}{12}" />
          <StackedFraction math="\frac{1}{5} + \frac{1}{10} = \frac{3}{10}" />
          <StackedFraction math="\frac{2}{4} = \frac{1}{2}" />
        </div>
      </section>

      {/* Mascot & Strength Meter */}
      <section className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-900">5. Friendly Robot Mascot</h2>
          <Card variant="student">
            <Mascot mood="happy" speech="Hello! I am your WhyWrong learning companion. Let's fix the thinking together!" />
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold font-display text-slate-900">6. Evidence Strength Meter</h2>
          <Card variant="student" className="space-y-4">
            <StrengthMeter strength="moderate" />
            <StrengthMeter strength="strong" />
          </Card>
        </div>
      </section>

      {/* Option Button States */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-display text-slate-900">7. Quiz Option Button States</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <OptionButton label="A" text="\frac{7}{12}" isSelected={true} />
          <OptionButton label="B" text="\frac{2}{7}" isWrong={true} />
          <OptionButton label="C" text="\frac{2}{12}" isCorrect={true} />
        </div>
      </section>
    </div>
  );
};
