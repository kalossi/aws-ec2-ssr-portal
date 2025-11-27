*** Settings ***
Library           Browser

***Variables***
${HEADLESS}   true
${BASE}        http://localhost:3000

*** Test Cases ***
Open Example Page
    # Open browser in headless mode
    New Browser    headless=${HEADLESS}
    New Page       https://example.com
    # Check title
    ${title}=      Get Title
    Should Be Equal    ${title}    Example Domain
    Close Browser

App Smoke — Resources Page Loads
    New Browser    headless=${HEADLESS}
    New Page       ${BASE}/resources
    Wait For Elements State    css=body    visible    timeout=13s
    ${title}=      Get Title
    Should Not Be Empty    ${title}
    Take Screenshot
    Close Browser

Resources Table Structure
    New Browser    headless=${HEADLESS}
    New Page       ${BASE}/resources
    Wait Until Keyword Succeeds    20    1s    Check Table Or NoInstances Visible
    ${has_table}=    Run Keyword And Return Status    Element Should Be Visible    css=table
    Run Keyword If    ${has_table}    Check Table Headers And Rows    ELSE    Log    "No table present — page shows no instances or different markup"    WARN
    Take Screenshot
    Close Browser

*** Keywords ***
Check Table Or NoInstances Visible
    ${table}=    Run Keyword And Return Status    Element Should Be Visible    css=table
    ${no}=       Run Keyword And Return Status    Element Should Be Visible    css=.no-instances
    Run Keyword If    ${table} or ${no}    Return From Keyword
    Dump Page For Debug
    Fail    Neither table nor .no-instances became visible

Dump Page For Debug
    ${ts}=    Get Time    result_format=%Y%m%d-%H%M%S
    ${shot}=    Set Variable    debug-${ts}.png
    Take Screenshot    ${shot}
    ${html}=    Get Source
    Log To Console    ==== PAGE HTML START ====
    Log To Console    ${html}
    Log To Console    ==== PAGE HTML END ====
    Log    Saved screenshot ${shot}

Validate First Row
    ${first_id}=    Get Text    css=table tbody tr:nth-child(1) td:nth-child(1)
    Should Match Regexp    ${first_id}    ^(i-[0-9a-fA-F]+|N/A)$
    # optional checks for other cells if available
    ${first_state}=    Get Text    css=table tbody tr:nth-child(1) td:nth-child(3)
    Should Not Be Empty    ${first_state}

