from typing import Dict

from ..llm_agent.conversational.main_graph import Node

WELCOME_MESSAGES: Dict[Node, str] = {
    "Adversaries": (
        "Welcome to the **Security Adversary Analysis** system on the GAI-CTI platform..\n"
        "I am the Threat Group Analyst Assistant and I provide you with information about Adversaries.\n"
    ),
    "Alert": (
        "Welcome to the **Security Alert Analysis** system on the GAI-CTI platform.\n"
        "This module is designed to support SOC analysts to review alerts, "
        "Detection Rules and Indicators of Threat (IoCs).\n"
        "I am ready to help you analyze this alert as your analytical assistant.\n\n"
        "You can ask for more details about the alert or request a more detailed analysis."
    ),
    "Alerts": (
        " Welcome to the **Security Alerts Analysis** module on the **GAI-CTI** platform Welcome.\n\n"
        "This section is designed to support SOC analysts in reviewing patterns, labels, and threat detection rules.\n"
        "As your analytics assistant, I'm here to help you analyze alert data, identify trends, and suggest next steps.\n\n"
    ),
    "Feed": (
        "Welcome to the **Feed Intelligence Analysis** module in the **GAI-CTI** system.\n\n"
        "In this section, you can ask questions about your threat collection sources (Feed Sources) — including their active status, "
        "the number of indicators collected, and details about each connector.\n\n"
        "As your SOC analytics assistant, I'm here to help you analyze feed data and provide guidance on connectors.\n\n"
    ),
    "Home": (
        " Welcome to the **Home section of the GAI-CTI** system Welcome.\n\nIn this section, you can see an overview of the system status, including a summary of threats, alerts, and recent security indicators.\n"
        "As an analytical assistant, I am ready to interpret the dashboard information for you — from the overall threat trend to statistical changes and important network activities.\n\n"
    ),
    "Log": (
        "Welcome to the **GAI-CTI System Log Analysis** section.\n\n"
        "In this section, you can access raw log data, examine time trends, "
        "and analytically evaluate behavioral patterns, volume changes, or threat indicators.\n"
        "As an analytical assistant of the SOC, I am ready to use the available tools to "
    ),
    "Rule": (
        "Welcome to the **GAI-CTI System Detection Rules** section.\n\n"
        "In this Section, you can access a set of threat detection rules; "
        "and prevent malicious behavior in the organizational environment.\n\n"
        "As a SOC Analytical Assistant, I am ready to:\n"
        "• Extract and interpret the technical details of each rule.\n"
    ),
    "TI": (
        "Welcome to the **Threat Intelligence** section of the **GAI-CTI** system.\n\n"
        "In this environment, you can review and analyze data related to indicators of penetration (IoCs), malware, and threat feeds.\n\n"
        "As your Analytical Assistant, I am ready to:\n"
        "• Analyze the relationships between IoCs, malware, and active tags.\n"
        "• Retrieve and interpret the technical details of each IoC or malware.\n"
        "• Analyze the growth and change of threats over time I will.\n\n"
    ),
}
