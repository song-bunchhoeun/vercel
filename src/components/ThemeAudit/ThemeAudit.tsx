'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from '@/components/ui/collapsible';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { ChevronDown, Info } from 'lucide-react';

const ThemeAudit = () => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    return (
        <TooltipProvider>
            <div className="p-8 space-y-12 bg-background text-foreground min-h-screen">
                <header className="space-y-2 border-b pb-4">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Theme Audit Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Use this page to ensure Tailwind variables align across
                        all components.
                    </p>
                </header>

                {/* --- FORMS & INPUTS --- */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold">Forms & Controls</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Inputs</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        placeholder="theme@example.com"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Comments</Label>
                                    <Textarea placeholder="Type your message here." />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="theme-mode" />
                                    <Label htmlFor="theme-mode">
                                        Enable Dark Mode
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Selections</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Select>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Theme Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="light">
                                            Light Mode
                                        </SelectItem>
                                        <SelectItem value="dark">
                                            Dark Mode
                                        </SelectItem>
                                        <SelectItem value="system">
                                            System
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <RadioGroup defaultValue="option-one">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="option-one"
                                            id="option-one"
                                        />
                                        <Label htmlFor="option-one">
                                            Primary Color
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                            value="option-two"
                                            id="option-two"
                                        />
                                        <Label htmlFor="option-two">
                                            Secondary Color
                                        </Label>
                                    </div>
                                </RadioGroup>

                                <div className="flex items-center space-x-2">
                                    <Checkbox id="terms" />
                                    <Label htmlFor="terms">
                                        Accept theme changes
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Interactive Elements</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Button variant="default">Default</Button>
                                    <Button variant="secondary">
                                        Secondary
                                    </Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="destructive">
                                        Destructive
                                    </Button>
                                </div>
                                <Separator />
                                <div className="flex gap-2">
                                    <Toggle variant="outline">
                                        <Info className="h-4 w-4" />
                                    </Toggle>
                                    <ToggleGroup
                                        type="multiple"
                                        variant="outline"
                                    >
                                        <ToggleGroupItem value="b">
                                            B
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="i">
                                            I
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="u">
                                            U
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* --- DATA & DISPLAYS --- */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold">Data Displays</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Table className="border rounded-md overflow-hidden">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Variable</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Value
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            --primary
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="default">
                                                Active
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            #22C55E
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            --radius
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                Global
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            0.5rem
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <div className="space-y-2">
                                <Label>Sync Progress</Label>
                                <Progress value={65} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border shadow w-fit"
                            />
                            <div className="flex gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[250px]" />
                                    <Skeleton className="h-4 w-[200px]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- OVERLAYS & NAVIGATION --- */}
                <section className="space-y-6">
                    <h2 className="text-2xl font-semibold">
                        Overlays & Navigation
                    </h2>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    Open Dialog Audit
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Theme Validation</DialogTitle>
                                    <DialogDescription>
                                        Check how modal overlays interact with
                                        background colors.
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Menu{' '}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>
                                    Audit Items
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    Profile Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Theme Switcher
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline">Popover Info</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <p className="text-sm">
                                    Testing popover text contrast and borders.
                                </p>
                            </PopoverContent>
                        </Popover>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost">Hover me</Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Tooltip theme audit</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive>
                                    2
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </section>

                <Collapsible className="w-full border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">
                            Advanced Theme Variables
                        </h4>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="pt-4 text-sm text-muted-foreground">
                        Testing collapsible animations and spacing rules.
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </TooltipProvider>
    );
};

export default ThemeAudit;
