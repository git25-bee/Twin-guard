import os
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn

def add_heading(doc, text, level=1):
    heading = doc.add_heading(text, level=level)
    heading.alignment = WD_ALIGN_PARAGRAPH.LEFT
    for run in heading.runs:
        run.font.name = 'Times New Roman'
        run.font.color.rgb = RGBColor(0, 0, 0)
        run.bold = True
        if level == 1:
            run.font.size = Pt(16)
        elif level == 2:
            run.font.size = Pt(14)
        else:
            run.font.size = Pt(12)
    return heading

def add_paragraph(doc, text, bold=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.line_spacing = 1.5
    p.paragraph_format.space_after = Pt(12)
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)
    run.bold = bold
    return p

def add_page_number(doc, number, format='arabic'):
    # In a real scenario we'd use complex oxml to add footer page numbers
    # For this script we will add a centered paragraph at the end of the page as a placeholder
    # because python-docx does not easily support different page number formats in the footer per section
    p = doc.add_paragraph(f"\n\n{number}")
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.runs[0]
    run.font.name = 'Times New Roman'
    run.font.size = Pt(12)

def generate_report():
    doc = Document()
    
    # Set default font for document
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)

    # PAGE 1: TITLE PAGE
    for _ in range(5): doc.add_paragraph()
    p = add_paragraph(doc, "TWINGUARD", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    p.runs[0].font.size = Pt(20)
    
    p = add_paragraph(doc, "AI-Powered Digital Twin for Smart Hospital Cyber Defense", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    p.runs[0].font.size = Pt(16)
    
    for _ in range(2): doc.add_paragraph()
    p = add_paragraph(doc, "A MINI PROJECT REPORT", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    for _ in range(2): doc.add_paragraph()
    add_paragraph(doc, "Submitted by", align=WD_ALIGN_PARAGRAPH.CENTER)
    
    for _ in range(1): doc.add_paragraph()
    add_paragraph(doc, "ALEX J          713524CS001\nSARAH K         713524CS002\nMICHAEL T       713524CS003\nEMMA W          713524CS004", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    for _ in range(2): doc.add_paragraph()
    add_paragraph(doc, "in partial fulfillment for the award of the degree of", align=WD_ALIGN_PARAGRAPH.CENTER)
    
    for _ in range(2): doc.add_paragraph()
    add_paragraph(doc, "BACHELOR OF ENGINEERING", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "in", align=WD_ALIGN_PARAGRAPH.CENTER)
    add_paragraph(doc, "COMPUTER SCIENCE AND ENGINEERING", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    for _ in range(2): doc.add_paragraph()
    add_paragraph(doc, "SNS COLLEGE OF TECHNOLOGY\nCOIMBATORE 641035", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    for _ in range(2): doc.add_paragraph()
    add_paragraph(doc, "November 2026", align=WD_ALIGN_PARAGRAPH.CENTER)
    
    add_page_number(doc, "i", format='roman')
    doc.add_page_break()

    # PAGE 2: BONAFIDE CERTIFICATE
    for _ in range(2): doc.add_paragraph()
    add_paragraph(doc, "SNS COLLEGE OF TECHNOLOGY\nCOIMBATORE 641035", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    for _ in range(2): doc.add_paragraph()
    p = add_paragraph(doc, "BONAFIDE CERTIFICATE", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    p.runs[0].font.size = Pt(16)
    
    for _ in range(2): doc.add_paragraph()
    add_paragraph(doc, "Certified that this mini Project Report titled, \"TWINGUARD - AI-Powered Digital Twin for Smart Hospital Cyber Defense\" is the bonafide record of \"Alex J, Sarah K, Michael T, Emma W\" who carried out the mini Project Work under our supervision. Certified further, that to the best of my knowledge the work reported herein does not form part of any other mini project report or dissertation on the basis of which a degree or award was conferred on an earlier occasion on this or any other candidate.")
    
    for _ in range(3): doc.add_paragraph()
    # Using a table to align guide and hod
    table = doc.add_table(rows=1, cols=2)
    table.alignment = WD_ALIGN_PARAGRAPH.CENTER
    table.allow_autofit = True
    
    cell1 = table.cell(0,0)
    p = cell1.add_paragraph("PROJECT GUIDE\n\nDr. A. Smith\nAssistant Professor,\nDepartment of AI & DS,\nSNS College Of Technology\nCoimbatore-641035.")
    p.runs[0].bold = True
    
    cell2 = table.cell(0,1)
    p = cell2.add_paragraph("HEAD OF THE DEPARTMENT\n\nDr. B. Johnson\nAssociate Professor & Head,\nDepartment of CSE,\nSNS College Of Technology\nCoimbatore-641035.")
    p.runs[0].bold = True
    
    for _ in range(4): doc.add_paragraph()
    add_paragraph(doc, "Submitted for the Viva-Voce examination held at SNS COLLEGE OF TECHNOLOGY, held on ...............................................")
    
    for _ in range(4): doc.add_paragraph()
    add_paragraph(doc, "Examiner 1                                                                                          Examiner 2", align=WD_ALIGN_PARAGRAPH.LEFT)
    
    add_page_number(doc, "ii", format='roman')
    doc.add_page_break()

    # PAGE 3: ABSTRACT
    for _ in range(2): doc.add_paragraph()
    p = add_paragraph(doc, "ABSTRACT", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    p.runs[0].font.size = Pt(16)
    
    for _ in range(1): doc.add_paragraph()
    add_paragraph(doc, "TwinGuard is an AI-powered Digital Twin system designed for Smart Hospital Cyber Defense. It serves as a comprehensive virtual hospital cybersecurity operations center (SOC). The system provides a real-time, simulated environment reflecting the complex network of a modern hospital, including critical infrastructure like patient databases, IoT medical devices, and firewall systems. TwinGuard allows security analysts to perform simultaneous cyber attack simulations, such as Ransomware and DDoS attacks, to observe dynamic risk score changes in real-time.")
    
    add_paragraph(doc, "A core component of TwinGuard is its integration with Google Gemini AI, which generates intelligent defense recommendations based on the active threat landscape. The system features an automated, multi-threaded defense engine that rapidly mitigates simulated threats, isolating compromised nodes and restoring network integrity. By providing dynamic risk analysis, automated mitigation, and database persistence, TwinGuard aims to improve the preparedness of healthcare institutions against sophisticated cyber threats, ensuring patient data security and uninterrupted medical services.")
    
    for _ in range(5): doc.add_paragraph()
    add_page_number(doc, "iii", format='roman')
    doc.add_page_break()
    
    # PAGE 4-6: TABLE OF CONTENTS
    for _ in range(2): doc.add_paragraph()
    p = add_paragraph(doc, "TABLE OF CONTENTS", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    p.runs[0].font.size = Pt(16)
    
    add_paragraph(doc, "CHAPTER NO.                TITLE                                                                         PAGE NO.", bold=True, align=WD_ALIGN_PARAGRAPH.LEFT)
    toc_entries = [
        (" ", "ABSTRACT", "iii"),
        (" ", "LIST OF TABLES", "vii"),
        (" ", "LIST OF FIGURES", "viii"),
        (" ", "LIST OF SYMBOLS", "ix"),
        ("1.", "INTRODUCTION", "1"),
        (" ", "1.1 Background", "1"),
        (" ", "1.2 Project Overview", "1"),
        (" ", "1.3 Motivation", "1"),
        (" ", "1.4 Objectives", "2"),
        (" ", "1.5 Scope", "2"),
        ("2.", "PROBLEM IDENTIFICATION", "3"),
        (" ", "2.1 Existing Scenario", "3"),
        (" ", "2.2 Existing System", "3"),
        (" ", "2.3 Existing System Drawbacks", "3"),
        (" ", "2.4 Problem Statement", "4"),
        (" ", "2.5 Proposed Solution", "4"),
        ("3.", "EMPATHIZE AND DEFINE", "5"),
        (" ", "3.1 Empathy Study", "5"),
        (" ", "3.2 User Identification", "5"),
        (" ", "3.3 Primary Users", "5"),
        (" ", "3.4 Secondary Users", "5"),
        (" ", "3.5 User Needs", "6"),
        (" ", "3.6 Pain Points", "6"),
        (" ", "3.7 User Persona", "7"),
        (" ", "3.8 User Expectations", "7"),
        (" ", "3.9 Refined Problem Definition", "7"),
        ("4.", "IDEATION", "8"),
        (" ", "4.1 Idea Generation", "8"),
        (" ", "4.2 Brainstorming", "8"),
        (" ", "4.3 Evaluation of Ideas", "8"),
        (" ", "4.4 Selected Idea", "9"),
        (" ", "4.5 Key Features Identified", "9"),
        (" ", "4.6 Final Concept", "10")
    ]
    
    for ch, title, pg in toc_entries:
        add_paragraph(doc, f"{ch:<4} {title:<70} {pg:>5}", align=WD_ALIGN_PARAGRAPH.LEFT)
    
    add_page_number(doc, "iv-vi", format='roman')
    doc.add_page_break()

    # PAGE 7: LIST OF TABLES
    p = add_paragraph(doc, "List of Tables", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    p.runs[0].font.size = Pt(16)
    
    tables_list = [
        ("2.1", "Comparison of Proposed Solutions", "4"),
        ("3.1", "User Pain Points and Proposed Solutions", "6")
    ]
    for num, title, pg in tables_list:
        add_paragraph(doc, f"{num:<4} {title:<70} {pg:>5}", align=WD_ALIGN_PARAGRAPH.LEFT)
    
    add_page_number(doc, "vii", format='roman')
    doc.add_page_break()
    
    # PAGE 8: LIST OF FIGURES
    p = add_paragraph(doc, "List of Figures", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    p.runs[0].font.size = Pt(16)
    
    figs_list = [
        ("1.1", "Overview of Architecture of TwinGuard", "2"),
        ("4.1", "Digital Twin Node Map", "10")
    ]
    for num, title, pg in figs_list:
        add_paragraph(doc, f"{num:<4} {title:<70} {pg:>5}", align=WD_ALIGN_PARAGRAPH.LEFT)
        
    add_page_number(doc, "viii", format='roman')
    doc.add_page_break()

    # PAGE 9: LIST OF SYMBOLS
    p = add_paragraph(doc, "List of Symbols, Abbreviations and Nomenclature", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    p.runs[0].font.size = Pt(14)
    
    symbols_list = [
        ("AI", "Artificial Intelligence"),
        ("SOC", "Security Operations Center"),
        ("DDoS", "Distributed Denial of Service"),
        ("IoT", "Internet of Things"),
        ("API", "Application Programming Interface")
    ]
    for sym, desc in symbols_list:
        add_paragraph(doc, f"{sym:<10} {desc}", align=WD_ALIGN_PARAGRAPH.LEFT)
        
    add_page_number(doc, "ix", format='roman')
    doc.add_page_break()

    # CHAPTER 1
    add_heading(doc, "Chapter 1", level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_heading(doc, "Introduction", level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    add_heading(doc, "1.1 Background", level=2)
    add_paragraph(doc, "Modern hospitals rely heavily on interconnected digital systems, including patient databases, IoT medical devices, and automated facility management networks. While these technologies improve patient care, they also expand the attack surface for cyber threats. Ransomware attacks and Distributed Denial of Service (DDoS) campaigns specifically target healthcare infrastructure, leading to data breaches, paralyzed medical services, and severe risk to patient lives. A reactive approach to these threats is insufficient in an era where attacks propagate in milliseconds.")
    
    add_heading(doc, "1.2 Project Overview", level=2)
    add_paragraph(doc, "TwinGuard is an AI-powered Digital Twin designed specifically for Smart Hospital Cyber Defense. The system serves as a virtual replica of a hospital's digital infrastructure, consisting of 12 distinct digital twin nodes. Security teams can use this virtual environment to simulate sophisticated cyber attacks, monitor dynamic risk scores, and utilize Google Gemini AI to generate instantaneous defense recommendations. An automated defense engine executes multi-threaded threat mitigation to neutralize attacks and restore system integrity.")
    
    add_heading(doc, "1.3 Motivation", level=2)
    add_paragraph(doc, "The primary motivation behind TwinGuard is the urgent need to transition hospital cybersecurity from reactive to proactive and predictive. Hospital administrators and Security Operations Center (SOC) teams require a safe, isolated environment to train against and visualize the impact of cyber attacks without risking the live hospital network. By integrating generative AI, TwinGuard aims to reduce the cognitive load on security analysts during high-stress incident response scenarios.")
    
    for _ in range(5): doc.add_paragraph()
    add_page_number(doc, "1", format='arabic')
    doc.add_page_break()
    
    add_heading(doc, "1.4 Objectives", level=2)
    add_paragraph(doc, "The main objectives of TwinGuard are:")
    add_paragraph(doc, "• To construct a realistic 12-node digital twin representing hospital IT infrastructure.")
    add_paragraph(doc, "• To enable simultaneous simulation of various cyber attacks (e.g., Ransomware, DDoS).")
    add_paragraph(doc, "• To implement dynamic risk scoring based on real-time node vulnerability.")
    add_paragraph(doc, "• To integrate Google Gemini AI for intelligent threat analysis and defense recommendations.")
    add_paragraph(doc, "• To develop an automated multi-threaded mitigation engine that executes defensive actions.")
    add_paragraph(doc, "• To ensure database persistence for post-incident reporting and analysis.")

    add_heading(doc, "1.5 Scope", level=2)
    add_paragraph(doc, "The scope of TwinGuard encompasses the development of a full-stack application (React frontend and Python FastAPI backend). It includes the simulation environment, AI integration for threat intelligence, dynamic risk calculation, and an automated response system. It focuses on demonstration and training scenarios for SOC teams. Figure 1.1 provides an overview of the TwinGuard architecture.")
    add_paragraph(doc, "[Insert Figure 1.1: Overview of Architecture of TwinGuard]")
    add_paragraph(doc, "Figure 1.1 presents the overall architecture of TwinGuard, demonstrating the flow of data between the digital twin nodes, the attack simulation engine, the AI-driven defense module, and the reporting dashboard. The system provides a centralized view for analysts to comprehend and interact with the hospital's security posture.")
    
    for _ in range(5): doc.add_paragraph()
    add_page_number(doc, "2", format='arabic')
    doc.add_page_break()
    
    # CHAPTER 2
    add_heading(doc, "Chapter 2", level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_heading(doc, "Problem Identification", level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    add_heading(doc, "2.1 Existing Scenario", level=2)
    add_paragraph(doc, "Currently, many hospitals manage their cybersecurity using a patchwork of standalone security tools, firewalls, and endpoint protection software. Security analysts monitor multiple disparate dashboards. When an attack occurs, analysts must manually correlate logs, determine the root cause, and formulate a response plan, often while the attack is actively spreading through the network.")
    
    add_heading(doc, "2.2 Existing System", level=2)
    add_paragraph(doc, "Existing systems rely heavily on manual intervention and static rule-based alerts. Training and simulation, if they occur, are typically tabletop exercises or run on isolated virtual machines that do not accurately reflect the interconnected complexity of modern IoT-enabled hospital networks.")
    
    add_heading(doc, "2.3 Existing System Drawbacks", level=2)
    add_paragraph(doc, "The existing approach to hospital cybersecurity has several drawbacks:")
    add_paragraph(doc, "• Lack of a cohesive, holistic view of the entire network's risk posture.")
    add_paragraph(doc, "• Slow response times due to manual log analysis and decision-making.")
    add_paragraph(doc, "• Inability to safely simulate attacks on production-like environments.")
    add_paragraph(doc, "• Overwhelming alert fatigue for SOC analysts.")
    add_paragraph(doc, "• Absence of AI-driven, context-aware remediation advice.")
    
    add_heading(doc, "2.4 Problem Statement", level=2)
    add_paragraph(doc, "Hospitals lack a comprehensive, safe, and intelligent simulation environment to visualize network vulnerabilities, train SOC analysts, and automate threat mitigation. This absence leaves healthcare institutions vulnerable to rapid-onset attacks like Ransomware, which can lock critical patient data before human analysts can intervene.")
    
    for _ in range(2): doc.add_paragraph()
    add_page_number(doc, "3", format='arabic')
    doc.add_page_break()
    
    add_heading(doc, "2.5 Proposed Solution", level=2)
    add_paragraph(doc, "TwinGuard proposes a centralized AI-powered Digital Twin. The system maps the hospital network into a visual graph, simulates attacks in real-time, calculates dynamic risk scores, leverages Gemini AI for immediate mitigation strategies, and automatically executes defense protocols.")
    
    add_paragraph(doc, "Table 2.1: Comparison of Proposed Solutions", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    table = doc.add_table(rows=5, cols=3)
    table.style = 'Table Grid'
    hdr_cells = table.rows[0].cells
    hdr_cells[0].text = 'S.No'
    hdr_cells[1].text = 'Feature'
    hdr_cells[2].text = 'TwinGuard (Proposed)'
    
    row_data = [
        ('1', 'Threat Visualization', 'Dynamic Digital Twin Graph'),
        ('2', 'Incident Response', 'AI-Assisted & Automated'),
        ('3', 'Training Environment', 'Safe, Realistic Simulation'),
        ('4', 'Risk Scoring', 'Real-time Aggregate Calculation')
    ]
    for i, (sno, feat, prop) in enumerate(row_data):
        row_cells = table.rows[i+1].cells
        row_cells[0].text = sno
        row_cells[1].text = feat
        row_cells[2].text = prop

    add_paragraph(doc, "\nTable 2.1 presents a comparison of the proposed solutions based on key features, highlighting how TwinGuard modernizes the incident response pipeline.")

    for _ in range(5): doc.add_paragraph()
    add_page_number(doc, "4", format='arabic')
    doc.add_page_break()

    # CHAPTER 3
    add_heading(doc, "Chapter 3", level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_heading(doc, "Empathize and Define", level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    add_heading(doc, "3.1 Empathy Study", level=2)
    add_paragraph(doc, "The empathy study focuses on understanding the high-pressure environment experienced by SOC analysts during a cyber attack. The primary goal is to identify their cognitive bottlenecks, expectations, and needs when facing rapid-onset threats in a critical healthcare setting.")
    
    add_heading(doc, "3.2 User Identification", level=2)
    add_paragraph(doc, "The primary users of TwinGuard are Security Operations Center (SOC) analysts and incident responders. The secondary users are hospital IT administrators and Chief Information Security Officers (CISOs) who monitor overall risk and compliance.")
    
    add_heading(doc, "3.3 Primary Users", level=2)
    add_paragraph(doc, "SOC analysts require immediate visibility into network status. They use the system to detect anomalies, review AI-generated mitigation strategies, and execute defense protocols to isolate compromised nodes.")
    
    add_heading(doc, "3.4 Secondary Users", level=2)
    add_paragraph(doc, "Hospital administrators and CISOs use the system to review post-incident summary reports, track historical risk trends, and evaluate the effectiveness of the automated defense mechanisms.")
    
    add_heading(doc, "3.5 User Needs", level=2)
    add_paragraph(doc, "The major user needs identified are:")
    add_paragraph(doc, "• Clear, visual representation of network health.")
    add_paragraph(doc, "• Real-time updates on active attacks.")
    add_paragraph(doc, "• Actionable, plain-English mitigation recommendations.")
    add_paragraph(doc, "• One-click automated defense execution.")
    add_paragraph(doc, "• Detailed logs for compliance and reporting.")
    
    for _ in range(2): doc.add_paragraph()
    add_page_number(doc, "5", format='arabic')
    doc.add_page_break()
    
    add_heading(doc, "3.6 Pain Points", level=2)
    add_paragraph(doc, "Users experience the following difficulties in traditional systems:")
    add_paragraph(doc, "• Alert fatigue from too many false positives.")
    add_paragraph(doc, "• Inability to prioritize critical alerts over minor ones.")
    add_paragraph(doc, "• Time lost cross-referencing multiple security dashboards.")
    add_paragraph(doc, "• Anxiety over making the wrong isolation decision and disrupting medical care.")

    add_paragraph(doc, "Table 3.1: User Pain Points and Proposed Solutions", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    table2 = doc.add_table(rows=4, cols=3)
    table2.style = 'Table Grid'
    hdr_cells = table2.rows[0].cells
    hdr_cells[0].text = 'S.No'
    hdr_cells[1].text = 'User Pain Point'
    hdr_cells[2].text = 'Proposed Solution'
    
    row_data2 = [
        ('1', 'Alert Fatigue', 'Aggregate dynamic risk scoring'),
        ('2', 'Slow decision making', 'Gemini AI defense recommendations'),
        ('3', 'Complex manual remediation', 'Automated multi-threaded mitigation')
    ]
    for i, (sno, pp, ps) in enumerate(row_data2):
        row_cells = table2.rows[i+1].cells
        row_cells[0].text = sno
        row_cells[1].text = pp
        row_cells[2].text = ps

    add_heading(doc, "3.7 User Persona", level=2)
    add_paragraph(doc, "A typical TwinGuard user is an intermediate-level SOC analyst. They are technically proficient but under immense pressure. They expect a unified dashboard that not only alerts them to a problem but acts as an intelligent assistant to help solve it.")
    
    add_heading(doc, "3.8 User Expectations", level=2)
    add_paragraph(doc, "Users expect a highly responsive UI, accurate AI recommendations with high confidence scores, and a reliable automated defense engine that neutralizes threats without causing collateral network failure.")
    
    add_heading(doc, "3.9 Refined Problem Definition", level=2)
    add_paragraph(doc, "There is a critical need for an intelligent, centralized digital twin platform that visualizes hospital network topology, simulates realistic attacks, and provides AI-backed, automated mitigation to drastically reduce incident response times and protect patient data.")
    
    for _ in range(2): doc.add_paragraph()
    add_page_number(doc, "6", format='arabic')
    doc.add_page_break()
    
    # CHAPTER 4
    add_heading(doc, "Chapter 4", level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    add_heading(doc, "Ideation", level=1).alignment = WD_ALIGN_PARAGRAPH.CENTER
    
    add_heading(doc, "4.1 Idea Generation", level=2)
    add_paragraph(doc, "Several concepts were explored to improve hospital cybersecurity training and response. The focus was on leveraging modern AI and visualization tools. Ideas considered included standalone AI chatbots for log analysis, physical network testbeds, and digital twin software simulations.")
    
    add_heading(doc, "4.2 Brainstorming", level=2)
    add_paragraph(doc, "Brainstorming focused on combining real-time graph visualization with generative AI. The team evaluated how to represent nodes (servers, firewalls, IoT devices) and how attacks would visually alter the state of these nodes to immediately communicate urgency to the user.")
    
    add_heading(doc, "4.3 Evaluation of Ideas", level=2)
    add_paragraph(doc, "• A physical testbed is too expensive and rigid to scale.")
    add_paragraph(doc, "• A pure log-analysis chatbot lacks the holistic visual context needed for fast response.")
    add_paragraph(doc, "• A Digital Twin provides the perfect balance of visual context, scalability, and safety for simulation.")
    
    add_heading(doc, "4.4 Selected Idea", level=2)
    add_paragraph(doc, "TwinGuard was selected as the final solution. It creates a software-based digital twin of a hospital network, integrating Cytoscape for visualization, Python for simulation logic, and Gemini AI for intelligent response generation.")
    
    for _ in range(5): doc.add_paragraph()
    add_page_number(doc, "7", format='arabic')
    doc.add_page_break()

    add_heading(doc, "4.5 Key Features Identified", level=2)
    add_paragraph(doc, "The ideation process resulted in the following core features:")
    add_paragraph(doc, "• 12-Node visual network topology graph.")
    add_paragraph(doc, "• Real-time attack simulation engine (Ransomware, DDoS).")
    add_paragraph(doc, "• Dynamic Hospital Risk Score calculation.")
    add_paragraph(doc, "• Gemini AI integration for mitigation strategies.")
    add_paragraph(doc, "• Automated Defense Engine with node isolation capabilities.")
    add_paragraph(doc, "• Persistent logging for incident reports.")

    add_heading(doc, "4.6 Final Concept", level=2)
    add_paragraph(doc, "The final concept for TwinGuard is a fully integrated web application where analysts can trigger simulated attacks, watch the network degrade visually, receive immediate AI-generated advice, and deploy automated defenses to restore the system to a safe state, all within a single unified dashboard.")
    
    for _ in range(10): doc.add_paragraph()
    add_page_number(doc, "8", format='arabic')

    doc.save("TwinGuard_Project_Report.docx")
    print("Document successfully created: TwinGuard_Project_Report.docx")

if __name__ == "__main__":
    generate_report()
