# Security

## Reporting

Please report a vulnerability privately through GitHub's security advisory form for this repository. Include a minimal reproduction and the affected version.

## Terminal output

Relay UI renders whatever text a tool passes to it, including table cells and Markdown. Tools that display untrusted input, such as log lines, command output, or model replies, should strip terminal control sequences before rendering them so the input cannot move the cursor or change terminal settings.
