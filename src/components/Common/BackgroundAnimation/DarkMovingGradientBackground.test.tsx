import { render, screen } from '@testing-library/react'
import DarkMovingGradientBackground from '@/components/Common/BackgroundAnimation/BackgroundAnimation'

describe('DarkMovingGradientBackground', () => {
  it('renders children properly', () => {
    render(
      <DarkMovingGradientBackground>
        <h1>Test Heading</h1>
      </DarkMovingGradientBackground>
    )

    const heading = screen.getByText('Test Heading')
    expect(heading).toBeInTheDocument()
  })

  it('applies the correct styles', () => {
    const { container } = render(
      <DarkMovingGradientBackground>
        <span>Content</span>
      </DarkMovingGradientBackground>
    )

    const div = container.firstChild as HTMLDivElement

    expect(div).toHaveStyle({
      position: 'relative',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundSize: '800% 800%',
      animation: 'gradientShift 10s ease infinite',
      color: '#f0f0f0',
    })
  })
})
