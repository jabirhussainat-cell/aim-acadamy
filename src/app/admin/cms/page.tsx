'use client';

import React, { useEffect, useState } from 'react';
import { Globe, Award, Users, Save, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';

interface CMSContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  aboutTitle: string;
  aboutText: string;
  philosophyTitle: string;
  philosophyText: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
}

interface DisciplineItem {
  _id?: string;
  name: string;
  code: string;
  description: string;
  beltHierarchy: string[];
}

interface MasterItem {
  _id?: string;
  name: string;
  title: string;
  discipline: string;
  experienceYears: number;
  bio: string;
}

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'DISCIPLINES' | 'MASTERS'>('CONTENT');

  const [content, setContent] = useState<CMSContent>({
    heroTitle: '',
    heroSubtitle: '',
    heroBadge: '',
    aboutTitle: '',
    aboutText: '',
    philosophyTitle: '',
    philosophyText: '',
    contactPhone: '8943839386',
    contactEmail: '',
    contactAddress: '',
  });

  const [disciplines, setDisciplines] = useState<DisciplineItem[]>([]);
  const [masters, setMasters] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New master form
  const [newMaster, setNewMaster] = useState({
    name: '',
    title: 'Chief Examiner & 7th Dan Black Belt',
    discipline: 'Karate-Do',
    experienceYears: 15,
    bio: 'Dedicated master with decades of tournament and instruction experience.',
  });

  async function loadData() {
    try {
      const res = await fetch('/api/cms');
      if (res.ok) {
        const data = await res.json();
        if (data.content) {
          setContent(data.content);
        }
        setDisciplines(data.disciplines || []);
        setMasters(data.masters || []);
      }
    } catch (err) {
      console.error('Failed to load CMS data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSaveContent(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'CONTENT', content }),
      });
      if (res.ok) {
        setMessage('Website homepage content updated successfully!');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddMaster(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/cms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'MASTER', master: newMaster }),
      });
      if (res.ok) {
        setMessage('Instructor / Master profile added successfully!');
        setNewMaster({
          name: '',
          title: 'Chief Examiner & 7th Dan Black Belt',
          discipline: 'Karate-Do',
          experienceYears: 15,
          bio: '',
        });
        loadData();
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error('Master error:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-900 rounded-lg"></div>
        <div className="h-64 bg-slate-900 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold uppercase tracking-wider text-white">
          Public Website CMS & Masters
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize homepage text, martial arts disciplines, and accredited masters without modifying code.
        </p>
      </div>

      {message && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-900/60 bg-emerald-950/40 text-emerald-300 text-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab('CONTENT')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'CONTENT' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Homepage Content
        </button>
        <button
          onClick={() => setActiveTab('DISCIPLINES')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'DISCIPLINES' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Disciplines ({disciplines.length})
        </button>
        <button
          onClick={() => setActiveTab('MASTERS')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
            activeTab === 'MASTERS' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          Masters & Instructors ({masters.length})
        </button>
      </div>

      {/* Tab 1: Content */}
      {activeTab === 'CONTENT' && (
        <form onSubmit={handleSaveContent} className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 flex items-center gap-2">
              <Globe className="h-4 w-4 text-rose-500" />
              <span>Hero & Introduction Section</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Headline</label>
              <input
                type="text"
                value={content.heroTitle}
                onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={content.heroSubtitle}
                onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Badge Text</label>
              <input
                type="text"
                value={content.heroBadge}
                onChange={(e) => setContent({ ...content, heroBadge: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span>About & Philosophy</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">About Title</label>
              <input
                type="text"
                value={content.aboutTitle}
                onChange={(e) => setContent({ ...content, aboutTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">About Text</label>
              <textarea
                rows={3}
                value={content.aboutText}
                onChange={(e) => setContent({ ...content, aboutText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Philosophy Title</label>
              <input
                type="text"
                value={content.philosophyTitle}
                onChange={(e) => setContent({ ...content, philosophyTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Philosophy Text</label>
              <textarea
                rows={3}
                value={content.philosophyText}
                onChange={(e) => setContent({ ...content, philosophyText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-950 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving Content...' : 'Save Website Content'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Disciplines */}
      {activeTab === 'DISCIPLINES' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disciplines.map((d) => (
              <div key={d.code} className="p-5 rounded-xl border border-slate-800 bg-slate-900/60">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white">{d.name}</h4>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-400">
                    {d.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{d.description}</p>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                    Belt Grading Hierarchy:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {d.beltHierarchy.map((b) => (
                      <span key={b} className="text-[10px] px-2 py-0.5 bg-slate-950 rounded text-slate-300 border border-slate-800">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Masters & Instructors */}
      {activeTab === 'MASTERS' && (
        <div className="space-y-6">
          {/* Add Master Form */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 pb-3 border-b border-slate-800 mb-4 flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-rose-500" />
              <span>Add Accredited Master / Instructor</span>
            </h3>

            <form onSubmit={handleAddMaster} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Master Full Name *</label>
                <input
                  type="text"
                  required
                  value={newMaster.name}
                  onChange={(e) => setNewMaster({ ...newMaster, name: e.target.value })}
                  placeholder="e.g. Master Rajesh Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title / Rank *</label>
                <input
                  type="text"
                  required
                  value={newMaster.title}
                  onChange={(e) => setNewMaster({ ...newMaster, title: e.target.value })}
                  placeholder="e.g. 7th Dan Black Belt Grandmaster"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Discipline *</label>
                <select
                  value={newMaster.discipline}
                  onChange={(e) => setNewMaster({ ...newMaster, discipline: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-rose-500 focus:outline-hidden"
                >
                  <option value="Karate-Do">Karate-Do</option>
                  <option value="Taekwondo">Taekwondo</option>
                  <option value="Kung Fu / Wushu">Kung Fu / Wushu</option>
                  <option value="Kickboxing">Kickboxing</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Years of Experience</label>
                <input
                  type="number"
                  min={1}
                  value={newMaster.experienceYears}
                  onChange={(e) =>
                    setNewMaster({ ...newMaster, experienceYears: Number(e.target.value) })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Bio / Profile Summary</label>
                <textarea
                  rows={2}
                  value={newMaster.bio}
                  onChange={(e) => setNewMaster({ ...newMaster, bio: e.target.value })}
                  placeholder="Instructor history and qualifications"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:border-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md transition"
                >
                  Save Master Profile
                </button>
              </div>
            </form>
          </div>

          {/* Existing Masters List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {masters.map((m) => (
              <div key={m._id} className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                <h4 className="text-sm font-bold text-white">{m.name}</h4>
                <p className="text-xs text-rose-400 font-medium">{m.title}</p>
                <p className="text-xs text-slate-400 mt-2">{m.bio}</p>
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                  <span>{m.discipline}</span>
                  <span className="text-amber-400 font-semibold">{m.experienceYears} yrs experience</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
