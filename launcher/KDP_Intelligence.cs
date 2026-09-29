using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;

namespace KDPIntelligence
{
    public class Program
    {
        private static Process serverProcess = null;
        private static NotifyIcon trayIcon = null;
        private static string appUrl = "http://localhost:3000";
        private static string projectDir = "";

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            projectDir = AppDomain.CurrentDomain.BaseDirectory;

            // Initialize System Tray Icon
            trayIcon = new NotifyIcon();
            trayIcon.Text = "KDP Intelligence Publishing OS";
            trayIcon.Icon = SystemIcons.Application;
            trayIcon.Visible = true;

            ContextMenu contextMenu = new ContextMenu();
            contextMenu.MenuItems.Add("Open KDP Intelligence", (s, e) => OpenApp(""));
            contextMenu.MenuItems.Add("Deep Market Scanner", (s, e) => OpenApp("/market/scanner"));
            contextMenu.MenuItems.Add("Book Studio", (s, e) => OpenApp("/studio/books"));
            contextMenu.MenuItems.Add("Manuscript Editor", (s, e) => OpenApp("/studio/editor"));
            contextMenu.MenuItems.Add("Kindle Studio", (s, e) => OpenApp("/studio/kindle"));
            contextMenu.MenuItems.Add("-");
            contextMenu.MenuItems.Add("Exit & Stop Server", (s, e) => ExitApp());
            trayIcon.ContextMenu = contextMenu;
            trayIcon.DoubleClick += (s, e) => OpenApp("");

            trayIcon.ShowBalloonTip(3000, "KDP Intelligence", "Starting publishing operating system in background...", ToolTipIcon.Info);

            // Start Server in background
            StartServer();

            // Wait for server ready in background thread
            Thread waitThread = new Thread(() =>
            {
                bool ready = WaitForServer(30);
                if (ready)
                {
                    trayIcon.ShowBalloonTip(3000, "KDP Intelligence Ready", "Connected to local operating system on port 3000.", ToolTipIcon.Info);
                    OpenApp("");
                }
                else
                {
                    OpenApp("");
                }
            });
            waitThread.IsBackground = true;
            waitThread.Start();

            // Run application message loop
            Application.Run();
        }

        private static void StartServer()
        {
            try
            {
                // Check if server is already responding
                if (IsServerAlive()) return;

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "cmd.exe";
                psi.Arguments = "/c npm.cmd run start || npm.cmd run dev";
                psi.WorkingDirectory = projectDir;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                psi.WindowStyle = ProcessWindowStyle.Hidden;

                serverProcess = Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Failed to launch background server: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private static bool IsServerAlive()
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(appUrl + "/api/admin/health?fast=true");
                request.Timeout = 4000;
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        private static bool WaitForServer(int timeoutSeconds)
        {
            for (int i = 0; i < timeoutSeconds; i++)
            {
                if (IsServerAlive()) return true;
                Thread.Sleep(1000);
            }
            return false;
        }

        private static void OpenApp(string route)
        {
            string target = appUrl + route;
            try
            {
                // Launch via Edge App mode (native frameless desktop window)
                string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
                if (!File.Exists(edgePath))
                {
                    edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
                }

                if (File.Exists(edgePath))
                {
                    Process.Start(edgePath, "--app=" + target + " --window-size=1440,900");
                    return;
                }

                // Fallback to Chrome App mode
                string chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
                if (!File.Exists(chromePath))
                {
                    chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");
                }

                if (File.Exists(chromePath))
                {
                    Process.Start(chromePath, "--app=" + target + " --window-size=1440,900");
                    return;
                }

                // Fallback to default browser
                Process.Start(target);
            }
            catch
            {
                Process.Start(target);
            }
        }

        private static void ExitApp()
        {
            if (trayIcon != null)
            {
                trayIcon.Visible = false;
                trayIcon.Dispose();
            }

            if (serverProcess != null && !serverProcess.HasExited)
            {
                try
                {
                    Process killProc = Process.Start(new ProcessStartInfo
                    {
                        FileName = "taskkill",
                        Arguments = "/F /T /PID " + serverProcess.Id,
                        CreateNoWindow = true,
                        UseShellExecute = false
                    });
                    if (killProc != null)
                    {
                        killProc.WaitForExit(2000);
                    }
                }
                catch { }
            }

            Application.Exit();
            Environment.Exit(0);
        }
    }
}
