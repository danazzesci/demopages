'use strict';
const topics = [
  {
    "title": "The Seven Patterns of AI Implementation",
    "description": "Recognize seven repeatable ways organizations apply AI to longstanding business and workforce problems, beyond chatbots, robotic process automation and simple task automation. Learn to connect a familiar business problem with an implementation pattern, so you can assess where AI may be useful without starting from a tool or a vendor’s promise."
  },
  {
    "title": "Three Ways to Operate AI in Cybersecurity",
    "description": "Distinguish AI assistance, automation and a third model: AI that constructs and evaluates evidence across an environment. Understand how each changes human responsibilities, cybersecurity visibility, and the speed and volume of decisions. This helps you recognize which operating model a proposed capability actually requires."
  },
  {
    "title": "Critical Mass: Preparing a Workforce to Operate AI",
    "description": "Identify activities that existing business, technical, assurance and operational roles must add, strengthen or rebalance when AI enters normal operations. Distinguish workforce preparation from AI literacy, technical training and strategy education, so you can recognize gaps in responsibilities and readiness that a training course alone will not resolve."
  },
  {
    "title": "Fundamental Tests for AI Implementation",
    "description": "Examine where inference and reasoning belong in an AI architecture and where deterministic logic is preferable. Trace how those choices affect reliability, token use, operating cost, error propagation, predictability and return on investment. Learn to recognize designs that use AI where fixed rules would produce a more dependable result."
  },
  {
    "title": "Testing AI: The Workforce Skill Beyond AI Expertise",
    "description": "Learn how human work shifts toward testing information, evidence, analysis and recommendations assembled by models. Recognize the applied testing skills business and technical practitioners need to judge output quality and decision readiness—and why this work cannot be left exclusively to AI specialists."
  }
];
const detail = document.querySelector('#topic-detail');
const buttons = [...document.querySelectorAll('[data-topic]')];
function selectTopic(index) {
  const topic = topics[index];
  if (!topic) return;
  for (const [i, button] of buttons.entries()) button.setAttribute('aria-pressed', String(i === index));
  const heading = document.createElement('h2');
  heading.textContent = topic.title;
  const description = document.createElement('p');
  description.textContent = topic.description;
  detail.replaceChildren(heading, description);
}
for (const [index, button] of buttons.entries()) button.addEventListener('click', () => selectTopic(index));
