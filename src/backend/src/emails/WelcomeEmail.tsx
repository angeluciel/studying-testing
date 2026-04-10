import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

type WelcomeEmailProps = {
    name: string;
    email: string;
    tempPassword: string;
    loginUrl: string;
};

export function WelcomeEmail({ name, email, tempPassword, loginUrl }: WelcomeEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Welcome — your account is ready</Preview>
            <Body style={{ backgroundColor: "#f4f4f5", fontFamily: "sans-serif" }}>
                <Container style={{ maxWidth: "480px", margin: "40px auto", backgroundColor: "#ffffff", borderRadius: "8px", padding: "32px" }}>
                    <Heading style={{ fontSize: "20px", color: "#111827" }}>
                        Welcome, {name}!
                    </Heading>
                    <Text style={{ color: "#374151" }}>
                        Your account has been created. Here are your login credentials:
                    </Text>
                    <Section style={{ backgroundColor: "#f9fafb", borderRadius: "6px", padding: "16px", margin: "16px 0" }}>
                        <Text style={{ margin: 0, color: "#374151", fontSize: "14px" }}>
                            <strong>Email:</strong> {email}
                        </Text>
                        <Text style={{ margin: "8px 0 0", color: "#374151", fontSize: "14px" }}>
                            <strong>Temporary password:</strong> {tempPassword}
                        </Text>
                    </Section>
                    <Text style={{ color: "#374151" }}>
                        Please change your password after your first login.
                    </Text>
                    <Section style={{ textAlign: "center", margin: "24px 0" }}>
                        <Button
                            href={loginUrl}
                            style={{ backgroundColor: "#111827", color: "#ffffff", padding: "12px 24px", borderRadius: "6px", textDecoration: "none", fontSize: "14px" }}
                        >
                            Go to login
                        </Button>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
