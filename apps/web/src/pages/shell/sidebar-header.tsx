import { useLingui } from "@lingui/react/macro";
import type { Bot } from "@rakazo/contracts";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@rakazo/ui-web";
import { Bell, PanelLeftClose, PanelLeftOpen, Plus, Search } from "lucide-react";
import { IconTooltip } from "../../components/IconTooltip";
import { ProductBrand } from "../../components/ProductBrand";
import { desktopBridge } from "../../lib/desktop";
import type { Panel } from "../../lib/right-panel-state";
import { WindowChrome } from "../WindowChrome";
import { BotCreatePicker } from "./bot-picker";

export function SidebarHeader({
  mini = false,
  createMenuOpen,
  setCreateMenuOpen,
  activityMode,
  toggleActivityMode,
  searchOpen = false,
  onSearch,
  setBotsSidebarCollapsedPref,
  bots,
  setMobileSidebarOpen,
  setPanel,
  navigate,
  setNewSpaceOpen,
  setCreateBotOpen,
}: {
  mini?: boolean;
  createMenuOpen: boolean;
  setCreateMenuOpen: (open: boolean) => void;
  activityMode: boolean;
  toggleActivityMode: () => void;
  searchOpen?: boolean;
  onSearch?: () => void;
  setBotsSidebarCollapsedPref: (collapsed: boolean) => void;
  bots: Bot[];
  setMobileSidebarOpen: (open: boolean) => void;
  setPanel: (panel: Panel) => void;
  navigate: (path: string) => void;
  setNewSpaceOpen: (open: boolean) => void;
  setCreateBotOpen: (open: boolean) => void;
}) {
  const { t } = useLingui();
  const hasWindowChrome = Boolean(desktopBridge());
  const toggleLabel = mini ? t`Show bots` : t`Minimize bots`;
  // In the icon rail the actions stack, so a label above or below covers its neighbour.
  const labelSide = mini ? "inline-end" : undefined;
  const tools = (
    <div className={`relative flex shrink-0 items-center ${mini ? "flex-col gap-0.5" : "gap-0.5"}`}>
      {onSearch ? (
        <IconTooltip label={t`Search`} side={labelSide}>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t`Search`}
            aria-pressed={searchOpen}
            data-testid="sidebar-search-trigger"
            onClick={onSearch}
            className="app-no-drag text-muted-foreground"
          >
            <Search size={15} strokeWidth={1.8} aria-hidden="true" />
          </Button>
        </IconTooltip>
      ) : null}
      <IconTooltip label={t`Activity`} side={labelSide}>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t`Activity`}
          aria-pressed={activityMode}
          data-activity-mode={activityMode ? "on" : "off"}
          onClick={toggleActivityMode}
          className={`app-no-drag ${activityMode ? "bg-accent text-foreground" : "text-muted-foreground"}`}
        >
          {/* A filled bell marks Activity on, so on and hovered never look alike. */}
          <Bell
            size={15}
            strokeWidth={1.8}
            fill={activityMode ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </Button>
      </IconTooltip>
      <IconTooltip label={toggleLabel} side={labelSide}>
        <Button
          variant="ghost"
          size="icon-sm"
          className="app-no-drag hidden text-muted-foreground md:inline-flex"
          aria-label={toggleLabel}
          data-testid={mini ? "restore-bots-sidebar" : "minimize-bots-sidebar"}
          onClick={() => setBotsSidebarCollapsedPref(!mini)}
        >
          {mini ? (
            <PanelLeftOpen size={15} strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <PanelLeftClose size={15} strokeWidth={1.8} aria-hidden="true" />
          )}
        </Button>
      </IconTooltip>
      <Popover open={createMenuOpen} onOpenChange={setCreateMenuOpen}>
        <IconTooltip label={t`Create`} side={labelSide}>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="app-no-drag text-muted-foreground"
              />
            }
            aria-label={t`Create`}
            data-testid="create-menu-trigger"
          >
            <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
          </PopoverTrigger>
        </IconTooltip>
        {/* Unmount with the state change so the panel it opens never coexists with the menu. */}
        {createMenuOpen ? (
          <PopoverContent
            align="end"
            className="app-no-drag w-auto gap-0 overflow-hidden p-0 data-closed:animate-none"
          >
            <BotCreatePicker
              bots={bots}
              onCreateBot={() => {
                setCreateMenuOpen(false);
                setMobileSidebarOpen(false);
                setCreateBotOpen(true);
              }}
              onOpenBot={(id) => {
                setCreateMenuOpen(false);
                setMobileSidebarOpen(false);
                navigate(`/app/${id}`);
              }}
              onCreateGroup={() => {
                setCreateMenuOpen(false);
                setMobileSidebarOpen(false);
                setPanel("create-group");
              }}
              onCreateSpace={() => {
                setCreateMenuOpen(false);
                setMobileSidebarOpen(false);
                setNewSpaceOpen(true);
              }}
            />
          </PopoverContent>
        ) : null}
      </Popover>
    </div>
  );

  if (mini) {
    return (
      <div
        className={`app-drag flex flex-col items-center gap-2 px-0 pb-2 ${hasWindowChrome ? "pt-2" : "pt-1"}`}
      >
        {hasWindowChrome ? <WindowChrome /> : null}
        <ProductBrand compact />
        {tools}
      </div>
    );
  }

  return (
    <div className="app-drag flex w-full items-center gap-1.5 pl-3 pr-2 pb-3 pt-3">
      {hasWindowChrome ? <WindowChrome /> : null}
      <ProductBrand />
      <div className="ml-auto shrink-0">{tools}</div>
    </div>
  );
}
