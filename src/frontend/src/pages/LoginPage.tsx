import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, Shield, FileSpreadsheet, BarChart3 } from 'lucide-react';

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left Column - Branding & Login */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
                  <GraduationCap className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Preschool LMS
                  </h1>
                  <p className="text-lg text-muted-foreground">Learning Management System</p>
                </div>
              </div>
              <p className="text-xl text-muted-foreground">
                Professional learning management platform designed specifically for preschools
              </p>
            </div>

            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>
                  Sign in with Internet Identity to access your preschool management dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={login}
                  disabled={isLoggingIn}
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Login with Internet Identity
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Features */}
          <div className="space-y-6">
            <img
              src="/assets/generated/preschool-hero.dim_1200x600.jpg"
              alt="Preschool Learning"
              className="rounded-2xl shadow-2xl"
            />
            
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Excel Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Import and export data seamlessly with Excel templates
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Dynamic Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Generate custom reports with flexible filtering options
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <img
                      src="/assets/generated/blocks-icon-transparent.dim_64x64.png"
                      alt="Forms"
                      className="h-8 w-8"
                    />
                  </div>
                  <CardTitle className="text-lg">Dynamic Forms</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Create and customize forms without any coding required
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100">
                    <Shield className="h-6 w-6 text-pink-600" />
                  </div>
                  <CardTitle className="text-lg">Secure Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Role-based access control with Internet Identity
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
