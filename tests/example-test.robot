*** Settings ***
Library           Browser

*** Test Cases ***
Open Example Page
    New Browser    headless=${ROBOT_HEADLESS}
    New Page       https://example.com
    Get Title      Should Be Equal    Example Domain
