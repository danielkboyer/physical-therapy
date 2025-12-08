/**
 * Shared utilities for DOM scraping in EMR integrations
 * These functions are designed to be injected into EMR pages via chrome.scripting.executeScript
 */

/**
 * Wait for an element to appear in the DOM
 * @param selector - CSS selector to wait for
 * @param timeout - Maximum time to wait in milliseconds
 * @returns Promise that resolves with the element or null if timeout
 */
export function waitForElement(selector: string, timeout = 5000): Promise<Element | null> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

/**
 * Try multiple selectors and return the first match
 * @param selectors - Array of CSS selectors to try
 * @param timeout - Maximum time to wait for each selector
 * @returns Promise that resolves with the element and matching selector, or null
 */
export async function waitForAnyElement(
  selectors: string[],
  timeout = 5000
): Promise<{ element: Element; selector: string } | null> {
  for (const selector of selectors) {
    const element = await waitForElement(selector, timeout);
    if (element) {
      return { element, selector };
    }
  }
  return null;
}

/**
 * Extract text content from an element safely
 * @param element - The element to extract text from
 * @returns The trimmed text content or empty string
 */
export function extractText(element: Element | null): string {
  return element?.textContent?.trim() || '';
}

/**
 * Extract all text from elements matching a selector
 * @param selector - CSS selector
 * @returns Array of text content from all matching elements
 */
export function extractAllText(selector: string): string[] {
  const elements = document.querySelectorAll(selector);
  return Array.from(elements).map(el => extractText(el)).filter(text => text.length > 0);
}

/**
 * Extract key-value pairs from a list of elements with label-value structure
 * Common pattern in EMR systems
 * @param containerSelector - Selector for the container elements
 * @param labelSelector - Selector for the label within each container
 * @param valueSelector - Selector for the value within each container
 * @returns Record of label-value pairs
 */
export function extractKeyValuePairs(
  containerSelector: string,
  labelSelector: string,
  valueSelector: string
): Record<string, string> {
  const details: Record<string, string> = {};
  const containers = document.querySelectorAll(containerSelector);

  containers.forEach(container => {
    const label = container.querySelector(labelSelector)?.textContent?.trim();
    const value = container.querySelector(valueSelector)?.textContent?.trim();

    if (label && value && value !== '-') {
      details[label] = value;
    }
  });

  return details;
}

/**
 * Parse a full name that may contain a nickname in quotes
 * Example: Danny "Dboy" Boyer -> { firstName: "Danny", lastName: "Boyer", nickName: "Dboy" }
 * @param fullNameText - The full name text to parse
 * @returns Parsed name components
 */
export function parseNameWithNickname(fullNameText: string): {
  firstName: string;
  lastName: string;
  nickName?: string;
} {
  let firstName = '';
  let lastName = '';
  let nickName: string | undefined;

  // Extract nickname from quotes
  const nicknameMatch = fullNameText.match(/"([^"]+)"/);
  if (nicknameMatch) {
    nickName = nicknameMatch[1];
  }

  // Remove nickname from full name to get first and last name
  const nameWithoutNickname = fullNameText.replace(/"[^"]+"/, '').trim();
  const nameParts = nameWithoutNickname.split(' ').filter(part => part.length > 0);

  if (nameParts.length >= 2) {
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ');
  } else if (nameParts.length === 1) {
    firstName = nameParts[0];
  }

  return { firstName, lastName, nickName };
}

/**
 * Wait for the page to be in a ready state
 * Useful for SPAs that need time to hydrate
 * @param timeout - Maximum time to wait
 * @returns Promise that resolves when page is ready
 */
export function waitForPageReady(timeout = 3000): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
      return;
    }

    const onReady = () => {
      resolve();
      document.removeEventListener('readystatechange', onReady);
    };

    document.addEventListener('readystatechange', onReady);

    setTimeout(() => {
      document.removeEventListener('readystatechange', onReady);
      resolve();
    }, timeout);
  });
}
