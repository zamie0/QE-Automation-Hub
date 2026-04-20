import type { Project } from "@/lib/mock-data";
import { Smartphone, Upload, Plus, Apple, Wifi, WifiOff, Loader2 } from "lucide-react";

export function MobileTab({ project }: { project: Project }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Builds */}
      <div className="rounded-3xl glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">App builds</h3>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-medium">
            <Upload className="h-3.5 w-3.5" /> Upload APK / IPA
          </button>
        </div>
        <div className="space-y-2">
          {project.builds.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">No builds uploaded.</div>
          )}
          {project.builds.map((b) => {
            const Icon = b.platform === "iOS" ? Apple : Smartphone;
            return (
              <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-white/70">
                <div className="h-10 w-10 rounded-xl bg-[image:var(--gradient-primary)] grid place-items-center text-white">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{b.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.platform} · v{b.version} · {b.size} · {b.uploaded}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Devices */}
      <div className="rounded-3xl glass p-6">
        <h3 className="font-semibold mb-4">Device manager</h3>
        <div className="space-y-2">
          {project.devices.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">No devices connected.</div>
          )}
          {project.devices.map((d) => {
            const StatusIcon =
              d.status === "online" ? Wifi : d.status === "busy" ? Loader2 : WifiOff;
            const statusColor =
              d.status === "online"
                ? "text-success"
                : d.status === "busy"
                  ? "text-warning-foreground"
                  : "text-muted-foreground";
            return (
              <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-white/70">
                <div className="h-10 w-10 rounded-xl bg-white/80 border border-white/70 grid place-items-center">
                  {d.os === "iOS" ? <Apple className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.os} {d.version}
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${statusColor}`}>
                  <StatusIcon className={`h-3.5 w-3.5 ${d.status === "busy" ? "animate-spin" : ""}`} />
                  {d.status}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Capability templates */}
      <div className="lg:col-span-2 rounded-3xl glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Capability templates</h3>
            <p className="text-xs text-muted-foreground">Reusable Appium / device configs</p>
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl glass text-xs font-medium">
            <Plus className="h-3.5 w-3.5" /> New template
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <pre className="rounded-xl bg-foreground text-background/95 text-xs font-mono p-4 overflow-x-auto">
{`# android-pixel-8.yml
platformName: Android
deviceName: Pixel 8 Pro
appPackage: io.tmforce.app
appActivity: .MainActivity
automationName: UiAutomator2`}
          </pre>
          <pre className="rounded-xl bg-foreground text-background/95 text-xs font-mono p-4 overflow-x-auto">
{`# ios-iphone-15.yml
platformName: iOS
deviceName: iPhone 15
bundleId: io.tmforce.ios
automationName: XCUITest
platformVersion: "17.4"`}
          </pre>
        </div>
      </div>
    </div>
  );
}
