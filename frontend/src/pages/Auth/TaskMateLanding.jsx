import React from "react";
import { Link } from "react-router-dom";

export default function TaskMateLanding() {
  return (
    <>
      {/* Meta and fonts, ideally place these in public/index.html */}
      <meta charSet="utf-8" />
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <title>TaskMate - Your Ultimate Task Manager</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?display=swap&family=Lexend:wght@400;500;700;900&family=Noto+Sans:wght@400;500;700;900"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
        rel="stylesheet"
      />

      <div className="overflow-x-hidden relative flex min-h-screen flex-col bg-gray-50">
        <header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link className="text-gray-900 text-xl" to="/">
                <span className="font-bold">Task</span><span className="font-normal">Mate</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link
                  className="rounded-md px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                  to="/signup-member"
                >
                  Register as Member
                </Link>
                <Link
                  className="rounded-md px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-sm"
                  to="/signup-admin"
                >
                  Register as Admin
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <section className="relative">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80")',
              }}
            ></div>
            <div className="absolute inset-0 bg-black/60"></div>
            <div className="relative w-full px-4 sm:px-6 lg:px-8 py-32 sm:py-48 lg:py-64 text-center text-white">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-tight">
                Organize Your Work, Streamline Your Life
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg leading-relaxed text-gray-200">
                TaskMate is the ultimate platform for managing your personal projects and collaborating with your team, all in one place.
              </p>
              <div className="mt-10 flex justify-center">
                <Link
                  className="rounded-lg px-20 py-5 text-xl font-semibold text-white backdrop-blur-md border border-white transition-colors transform hover:scale-105 hover:bg-white/10"
                  to="/login"
                >
                  Login
                </Link>
              </div>
            </div>
          </section>

          <section className="py-20 sm:py-28 bg-white">
            <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Key Features of TaskMate
                </h2>
                <p className="mt-4 text-lg text-gray-600">
                  Our platform offers a range of features designed to enhance your productivity and teamwork.
                </p>
              </div>
              <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-md transition-transform transform hover:-translate-y-2">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-600 text-white mb-6">
                    <span className="material-symbols-outlined text-4xl">
                      task_alt
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Effortless Task Creation
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Quickly create, assign, and prioritize tasks.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-md transition-transform transform hover:-translate-y-2">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-600 text-white mb-6">
                    <span className="material-symbols-outlined text-4xl">
                      groups
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Team Collaboration
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Assign tasks individually or in groups.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-md transition-transform transform hover:-translate-y-2">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-600 text-white mb-6">
                    <span className="material-symbols-outlined text-4xl">
                      monitoring
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Progress Tracking
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Visualize team and individual progress with dashboards.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg shadow-md transition-transform transform hover:-translate-y-2">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-sky-600 text-white mb-6">
                    <span className="material-symbols-outlined text-4xl">
                      calendar_month
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Google Calendar Sync
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Sync task due dates directly to your calendar.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-gray-800 text-white">
          <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-400">
              <p>© 2025 TaskMate. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

