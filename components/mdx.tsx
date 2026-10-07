import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Steps, Step } from 'fumadocs-ui/components/steps';
import { Tabs, Tab } from 'fumadocs-ui/components/tabs';
import { Accordions, Accordion } from 'fumadocs-ui/components/accordion';
import type { MDXComponents } from 'mdx/types';
import { Callout } from './docs/Callout';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Callout,
    Steps,
    Step,
    Tabs,
    Tab,
    Accordions,
    Accordion,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
